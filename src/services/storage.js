import { STORAGE_KEYS } from '../utils/constants';

/**
 * Save game state to localStorage
 * @param {Object} state - Game state to save
 * @returns {boolean} Success status
 */
export function saveGameState(state) {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, serialized);
    return true;
  } catch (error) {
    console.error('Failed to save game state:', error);
    // Handle quota exceeded
    if (error.name === 'QuotaExceededError') {
      // Clear old data and try again
      clearOldData();
      try {
        const serialized = JSON.stringify(state);
        localStorage.setItem(STORAGE_KEYS.GAME_STATE, serialized);
        return true;
      } catch (retryError) {
        console.error('Failed to save even after clearing:', retryError);
        return false;
      }
    }
    return false;
  }
}

/**
 * Load game state from localStorage
 * @returns {Object|null} Loaded state or null if not found
 */
export function loadGameState() {
  try {
    const serialized = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    if (serialized === null) {
      return null;
    }
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

/**
 * Clear game state from localStorage
 */
export function clearGameState() {
  try {
    localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
}

/**
 * Save player profile to localStorage
 * @param {Object} profile - Player profile
 * @returns {boolean} Success status
 */
export function savePlayerProfile(profile) {
  try {
    const serialized = JSON.stringify(profile);
    localStorage.setItem(STORAGE_KEYS.PLAYER_PROFILE, serialized);
    return true;
  } catch (error) {
    console.error('Failed to save player profile:', error);
    return false;
  }
}

/**
 * Load player profile from localStorage
 * @returns {Object|null} Loaded profile or null
 */
export function loadPlayerProfile() {
  try {
    const serialized = localStorage.getItem(STORAGE_KEYS.PLAYER_PROFILE);
    if (serialized === null) {
      return null;
    }
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Failed to load player profile:', error);
    return null;
  }
}

/**
 * Save leaderboard to localStorage
 * @param {Array} scores - Array of score objects
 * @returns {boolean} Success status
 */
export function saveLeaderboard(scores) {
  try {
    // Keep only top 10 scores
    const topScores = scores
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10);

    const serialized = JSON.stringify(topScores);
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, serialized);
    return true;
  } catch (error) {
    console.error('Failed to save leaderboard:', error);
    return false;
  }
}

/**
 * Get leaderboard from localStorage
 * @returns {Array} Array of score objects
 */
export function getLeaderboard() {
  try {
    const serialized = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (serialized === null) {
      return [];
    }
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Failed to load leaderboard:', error);
    return [];
  }
}

/**
 * Add score to leaderboard
 * @param {Object} scoreEntry - Score entry to add
 * @returns {boolean} Success status
 */
export function addToLeaderboard(scoreEntry) {
  const leaderboard = getLeaderboard();
  leaderboard.push({
    ...scoreEntry,
    timestamp: Date.now(),
  });
  return saveLeaderboard(leaderboard);
}

/**
 * Clear old data to free up space
 * Removes oldest game states and keeps only recent ones
 */
function clearOldData() {
  try {
    // Clear old game state (keep only current)
    // Could be expanded to manage multiple save slots
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cycling_game_') && !Object.values(STORAGE_KEYS).includes(key)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear old data:', error);
  }
}

/**
 * Get total localStorage usage
 * @returns {number} Approximate size in bytes
 */
export function getStorageSize() {
  let total = 0;
  try {
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
  } catch (error) {
    console.error('Failed to calculate storage size:', error);
  }
  return total;
}

/**
 * Check if storage is available
 * @returns {boolean} True if localStorage is available
 */
export function isStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}
