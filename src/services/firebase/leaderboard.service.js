import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { ensureAuth } from './auth.service';
import { calculateFinalScore } from '../calculations';

// Firestore collection names
const COLLECTIONS = {
  LEADERBOARD: 'leaderboard',
  GAME_RECORDS: 'game_records',
};

/**
 * Generate checksum for score validation
 * @param {Object} scoreData
 * @returns {string}
 */
const generateChecksum = (scoreData) => {
  const data = JSON.stringify({
    score: scoreData.totalScore,
    time: scoreData.completionTime,
    team: scoreData.teamFinished,
    timestamp: scoreData.timestamp,
  });

  // Simple hash function (in production, use crypto.subtle.digest)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

/**
 * Validate score data
 * @param {Object} scoreData
 * @returns {boolean}
 */
const validateScore = (scoreData) => {
  // Score range validation
  if (scoreData.totalScore < 0 || scoreData.totalScore > 5000) {
    console.error('Invalid score range:', scoreData.totalScore);
    return false;
  }

  // Time validation (6-24 hours for 380km)
  const minTime = 6 * 3600; // 6 hours
  const maxTime = 24 * 3600; // 24 hours
  if (scoreData.completionTime < minTime || scoreData.completionTime > maxTime) {
    console.error('Invalid completion time:', scoreData.completionTime);
    return false;
  }

  // Average speed validation (15-65 km/h)
  const avgSpeed = 380 / (scoreData.completionTime / 3600);
  if (avgSpeed < 15 || avgSpeed > 65) {
    console.error('Unrealistic average speed:', avgSpeed);
    return false;
  }

  return true;
};

/**
 * Submit score to global leaderboard
 * @param {Object} gameData
 * @returns {Promise<Object>} Result with rank
 */
export const submitScore = async (gameData) => {
  try {
    // Ensure user is authenticated
    const userId = await ensureAuth();

    // Calculate final score
    const scoreData = calculateFinalScore({
      completionTime: gameData.completionTime,
      teamFinished: gameData.teamFinished,
      totalTeamSize: gameData.totalTeamSize,
      averageFatigue: gameData.averageFatigue,
      budgetUsed: gameData.budgetUsed,
      budgetLimit: gameData.budgetLimit || 5000,
      eventsHandled: gameData.eventsHandled || 0,
      mechanicalFailures: gameData.mechanicalFailures || 0,
      weatherChallenges: gameData.weatherChallenges || 0,
    });

    const submissionData = {
      userId,
      playerName: gameData.playerName || '匿名玩家',
      totalScore: scoreData.totalScore,
      completionTime: gameData.completionTime,
      teamFinished: gameData.teamFinished,
      totalTeamSize: gameData.totalTeamSize,
      teamComposition: gameData.teamComposition || [],
      route: gameData.route || '平衡路線',
      timestamp: serverTimestamp(),
      checksum: '', // Will be set after
    };

    // Generate checksum
    submissionData.checksum = generateChecksum({
      ...submissionData,
      timestamp: Date.now(),
    });

    // Validate before submission
    if (!validateScore(submissionData)) {
      throw new Error('Score validation failed');
    }

    // Submit to Firestore
    const docRef = await addDoc(collection(db, COLLECTIONS.LEADERBOARD), submissionData);

    // Get rank
    const rank = await getUserRank(submissionData.totalScore);

    console.log('Score submitted successfully:', docRef.id);

    return {
      success: true,
      id: docRef.id,
      rank,
      score: submissionData.totalScore,
    };
  } catch (error) {
    console.error('Error submitting score:', error);
    throw error;
  }
};

/**
 * Get user's global rank
 * @param {number} score
 * @returns {Promise<number>}
 */
export const getUserRank = async (score) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.LEADERBOARD),
      where('totalScore', '>', score),
      orderBy('totalScore', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.size + 1; // Rank is number of higher scores + 1
  } catch (error) {
    console.error('Error getting rank:', error);
    return null;
  }
};

/**
 * Get global leaderboard
 * @param {number} limitCount
 * @returns {Promise<Array>}
 */
export const getGlobalLeaderboard = async (limitCount = 100) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.LEADERBOARD),
      orderBy('totalScore', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const leaderboard = [];

    snapshot.forEach((doc, index) => {
      leaderboard.push({
        id: doc.id,
        rank: index + 1,
        ...doc.data(),
      });
    });

    return leaderboard;
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    throw error;
  }
};

/**
 * Get today's leaderboard
 * @param {number} limitCount
 * @returns {Promise<Array>}
 */
export const getTodayLeaderboard = async (limitCount = 50) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, COLLECTIONS.LEADERBOARD),
      where('timestamp', '>=', Timestamp.fromDate(today)),
      orderBy('timestamp', 'desc'),
      orderBy('totalScore', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const leaderboard = [];

    snapshot.forEach((doc, index) => {
      leaderboard.push({
        id: doc.id,
        rank: index + 1,
        ...doc.data(),
      });
    });

    return leaderboard;
  } catch (error) {
    console.error('Error fetching today leaderboard:', error);
    throw error;
  }
};

/**
 * Get this week's leaderboard
 * @param {number} limitCount
 * @returns {Promise<Array>}
 */
export const getWeekLeaderboard = async (limitCount = 50) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const q = query(
      collection(db, COLLECTIONS.LEADERBOARD),
      where('timestamp', '>=', Timestamp.fromDate(weekAgo)),
      orderBy('timestamp', 'desc'),
      orderBy('totalScore', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const leaderboard = [];

    snapshot.forEach((doc, index) => {
      leaderboard.push({
        id: doc.id,
        rank: index + 1,
        ...doc.data(),
      });
    });

    return leaderboard;
  } catch (error) {
    console.error('Error fetching week leaderboard:', error);
    throw error;
  }
};

/**
 * Get user's personal records
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export const getUserRecords = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.LEADERBOARD),
      where('userId', '==', userId),
      orderBy('totalScore', 'desc'),
      limit(10)
    );

    const snapshot = await getDocs(q);
    const records = [];

    snapshot.forEach((doc) => {
      records.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return records;
  } catch (error) {
    console.error('Error fetching user records:', error);
    throw error;
  }
};

export default {
  submitScore,
  getUserRank,
  getGlobalLeaderboard,
  getTodayLeaderboard,
  getWeekLeaderboard,
  getUserRecords,
};
