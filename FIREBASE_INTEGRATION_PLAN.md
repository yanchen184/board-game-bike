# 🔥 Firebase Integration & Leaderboard Technical Implementation Plan

## Executive Summary

This document outlines a comprehensive plan for integrating Firebase services into the Cycling Game (一日北高挑戰) to enable cloud-based leaderboards, user authentication, and real-time data synchronization. The integration will maintain compatibility with the existing Redux architecture while adding robust security measures to prevent cheating.

---

## 1. Firebase Services Architecture

### 1.1 Required Firebase Services

#### **Firebase Authentication**
- Anonymous authentication for quick play
- Optional email/password for persistent profiles
- Social login (Google, Facebook) for future expansion

#### **Firestore Database**
- Primary data storage for user profiles and game records
- Better querying capabilities for leaderboards
- Real-time listeners for live leaderboard updates

#### **Firebase Realtime Database** (Optional)
- For real-time multiplayer features (future)
- Live race progress tracking

#### **Firebase Hosting**
- CDN-based hosting with SSL
- Automatic deployment via GitHub Actions

#### **Cloud Functions**
- Server-side score validation
- Anti-cheat mechanisms
- Scheduled leaderboard cleanup

### 1.2 Architecture Diagram

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   React App │────▶│ Firebase SDK │────▶│  Firestore  │
│   (Redux)   │     │  (Services)  │     │  Database   │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │                     │
       ▼                    ▼                     ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│Redux Actions│     │    Auth      │     │Cloud Function│
│  & Slices   │     │   Service    │     │ Validation  │
└─────────────┘     └──────────────┘     └─────────────┘
```

---

## 2. Data Structure Design

### 2.1 Firestore Collections Structure

```javascript
// Collection: users
{
  userId: "uid_xxx", // Document ID (from Auth)
  profile: {
    displayName: "PlayerName",
    email: "email@example.com",
    createdAt: Timestamp,
    lastLoginAt: Timestamp,
    stats: {
      gamesPlayed: 0,
      bestTime: null,
      totalDistance: 0,
      averageScore: 0
    },
    preferences: {
      language: "zh-TW",
      soundEnabled: true,
      notifications: false
    }
  }
}

// Collection: gameRecords
{
  recordId: "auto_generated", // Document ID
  userId: "uid_xxx",
  playerName: "PlayerName",
  timestamp: Timestamp,
  gameData: {
    completionTime: 43200, // seconds
    totalScore: 2580,
    teamConfiguration: {
      members: [...], // Team member details
      formation: "train",
      bikeConfig: {...}
    },
    metrics: {
      distance: 380,
      avgSpeed: 31.6,
      teamIntegrityRate: 100,
      efficiency: 85,
      budgetEfficiency: 92
    },
    scoreBreakdown: {
      timeBonus: 1100,
      teamBonus: 500,
      efficiencyBonus: 255,
      budgetBonus: 184,
      eventBonus: 150,
      specialBonus: 500,
      failurePenalty: -109
    }
  },
  validation: {
    checksum: "hash_value", // For integrity check
    version: "1.0.0", // Game version
    validated: false, // Server validation status
    suspicious: false // Cheat detection flag
  }
}

// Collection: leaderboards
{
  boardId: "global_2024_01", // Document ID (monthly boards)
  type: "global", // global, weekly, daily
  period: "2024-01",
  entries: [ // Denormalized for performance
    {
      rank: 1,
      userId: "uid_xxx",
      playerName: "TopPlayer",
      score: 3250,
      completionTime: 39600,
      timestamp: Timestamp,
      verified: true
    },
    // ... up to 100 entries
  ],
  metadata: {
    lastUpdated: Timestamp,
    totalEntries: 1250,
    nextPageToken: "xxx" // For pagination
  }
}

// Collection: achievements (future)
{
  achievementId: "first_completion",
  userId: "uid_xxx",
  unlockedAt: Timestamp,
  metadata: {...}
}
```

### 2.2 Composite Indexes for Performance

```javascript
// Required Firestore indexes
const indexes = [
  // For global leaderboard queries
  {
    collection: 'gameRecords',
    fields: [
      { field: 'gameData.totalScore', order: 'DESCENDING' },
      { field: 'timestamp', order: 'DESCENDING' }
    ]
  },
  // For user-specific records
  {
    collection: 'gameRecords',
    fields: [
      { field: 'userId', order: 'ASCENDING' },
      { field: 'gameData.totalScore', order: 'DESCENDING' }
    ]
  },
  // For time-based leaderboards
  {
    collection: 'gameRecords',
    fields: [
      { field: 'timestamp', order: 'DESCENDING' },
      { field: 'gameData.totalScore', order: 'DESCENDING' }
    ]
  },
  // For validation queries
  {
    collection: 'gameRecords',
    fields: [
      { field: 'validation.validated', order: 'ASCENDING' },
      { field: 'validation.suspicious', order: 'ASCENDING' },
      { field: 'timestamp', order: 'DESCENDING' }
    ]
  }
];
```

---

## 3. Firebase Security Rules

### 3.1 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isValidScore(score) {
      // Max possible score based on game mechanics
      return score >= 0 && score <= 5000;
    }

    function isValidCompletionTime(time) {
      // Between 6 hours and 24 hours
      return time >= 21600 && time <= 86400;
    }

    function hasRequiredGameFields() {
      let data = request.resource.data.gameData;
      return data.keys().hasAll([
        'completionTime', 'totalScore', 'teamConfiguration', 'metrics', 'scoreBreakdown'
      ]);
    }

    function isValidChecksum() {
      // Verify data hasn't been tampered with
      let gameData = request.resource.data.gameData;
      let expectedChecksum =
        hash(gameData.completionTime + gameData.totalScore + gameData.metrics.distance);
      return request.resource.data.validation.checksum == expectedChecksum;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId) &&
        request.resource.data.keys().hasAll(['profile']) &&
        request.resource.data.profile.keys().hasAll(['displayName', 'createdAt']);
      allow update: if isOwner(userId) &&
        // Prevent updating critical fields
        !request.resource.data.diff(resource.data).affectedKeys()
          .hasAny(['profile.createdAt', 'profile.stats']);
      allow delete: if false; // Never allow deletion
    }

    // Game records collection
    match /gameRecords/{recordId} {
      allow read: if true; // Public leaderboard
      allow create: if isAuthenticated() &&
        request.auth.uid == request.resource.data.userId &&
        hasRequiredGameFields() &&
        isValidScore(request.resource.data.gameData.totalScore) &&
        isValidCompletionTime(request.resource.data.gameData.completionTime) &&
        isValidChecksum() &&
        // Rate limiting: max 1 submission per minute
        (!exists(/databases/$(database)/documents/rateLimits/$(request.auth.uid)) ||
         resource.data.lastSubmission < request.time - duration.value(1, 'm'));
      allow update: if false; // Records are immutable
      allow delete: if false; // Records cannot be deleted
    }

    // Leaderboards collection (read-only, updated by Cloud Functions)
    match /leaderboards/{boardId} {
      allow read: if true;
      allow write: if false; // Only Cloud Functions can write
    }

    // Rate limiting collection
    match /rateLimits/{userId} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId);
    }
  }
}
```

### 3.2 Anti-Cheat Validation Rules

```javascript
// Additional validation in Cloud Functions
const validateGameRecord = (record) => {
  const validations = {
    // Score calculation verification
    scoreIntegrity: () => {
      const { scoreBreakdown } = record.gameData;
      const calculatedTotal = Object.values(scoreBreakdown)
        .reduce((sum, val) => sum + val, 0);
      return Math.abs(calculatedTotal - record.gameData.totalScore) < 1;
    },

    // Time-distance validation
    physicsCheck: () => {
      const { completionTime, metrics } = record.gameData;
      const avgSpeed = metrics.distance / (completionTime / 3600);
      // Realistic speed range: 15-40 km/h
      return avgSpeed >= 15 && avgSpeed <= 40;
    },

    // Team configuration validation
    teamCheck: () => {
      const { teamConfiguration } = record.gameData;
      const validFormations = ['single', 'double', 'train'];
      const teamSize = teamConfiguration.members.length;
      return teamSize >= 2 && teamSize <= 4 &&
             validFormations.includes(teamConfiguration.formation);
    },

    // Statistical anomaly detection
    anomalyCheck: () => {
      const { metrics } = record.gameData;
      // Check for impossible efficiency values
      return metrics.efficiency >= 0 && metrics.efficiency <= 100 &&
             metrics.budgetEfficiency >= 0 && metrics.budgetEfficiency <= 100 &&
             metrics.teamIntegrityRate >= 0 && metrics.teamIntegrityRate <= 100;
    },

    // Client version check
    versionCheck: () => {
      const supportedVersions = ['1.0.0', '1.0.1', '1.1.0'];
      return supportedVersions.includes(record.validation.version);
    }
  };

  return Object.entries(validations).every(([name, check]) => {
    const result = check();
    if (!result) console.warn(`Validation failed: ${name}`);
    return result;
  });
};
```

---

## 4. Integration Architecture

### 4.1 Firebase Service Layer

```javascript
// src/services/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Connect to emulators in development
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

export default app;
```

### 4.2 Service Layer Architecture

```javascript
// src/services/firebase/auth.service.js
import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = new Set();
    this.initAuthListener();
  }

  initAuthListener() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.notifyListeners(user);
    });
  }

  async signInAnonymously() {
    try {
      const result = await signInAnonymously(auth);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Anonymous sign in failed:', error);
      return { success: false, error: error.message };
    }
  }

  async signInWithEmail(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async registerWithEmail(email, password, displayName) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      await auth.signOut();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(user) {
    this.listeners.forEach(callback => callback(user));
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  getCurrentUser() {
    return this.currentUser;
  }
}

export default new AuthService();
```

```javascript
// src/services/firebase/leaderboard.service.js
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './config';
import { calculateChecksum } from '../../utils/security';

class LeaderboardService {
  constructor() {
    this.cache = new Map();
    this.listeners = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  }

  async submitScore(gameData, userId, playerName) {
    try {
      // Generate checksum for validation
      const checksum = calculateChecksum(gameData);

      // Prepare record
      const record = {
        userId,
        playerName,
        timestamp: serverTimestamp(),
        gameData,
        validation: {
          checksum,
          version: import.meta.env.VITE_GAME_VERSION || '1.0.0',
          validated: false,
          suspicious: false
        }
      };

      // Submit to Firestore
      const docRef = doc(collection(db, 'gameRecords'));
      await setDoc(docRef, record);

      // Trigger Cloud Function for validation (async)
      // This will be handled by Firestore triggers

      // Clear relevant caches
      this.clearCache('global');
      this.clearCache(`user_${userId}`);

      return { success: true, recordId: docRef.id };
    } catch (error) {
      console.error('Failed to submit score:', error);
      return { success: false, error: error.message };
    }
  }

  async getGlobalLeaderboard(pageSize = 50, pageToken = null) {
    const cacheKey = `global_${pageSize}_${pageToken}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }
    }

    try {
      let q = query(
        collection(db, 'gameRecords'),
        where('validation.validated', '==', true),
        where('validation.suspicious', '==', false),
        orderBy('gameData.totalScore', 'desc'),
        limit(pageSize)
      );

      if (pageToken) {
        const lastDoc = await getDoc(doc(db, 'gameRecords', pageToken));
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const entries = [];
      let lastVisible = null;

      snapshot.forEach((doc) => {
        entries.push({
          id: doc.id,
          ...doc.data(),
          rank: entries.length + 1 + (pageToken ? pageSize : 0)
        });
        lastVisible = doc;
      });

      const result = {
        entries,
        nextPageToken: lastVisible?.id || null,
        hasMore: entries.length === pageSize
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      throw error;
    }
  }

  async getUserBestScores(userId, limit = 10) {
    const cacheKey = `user_${userId}_${limit}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }
    }

    try {
      const q = query(
        collection(db, 'gameRecords'),
        where('userId', '==', userId),
        orderBy('gameData.totalScore', 'desc'),
        limit(limit)
      );

      const snapshot = await getDocs(q);
      const scores = [];

      snapshot.forEach((doc) => {
        scores.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Cache the result
      this.cache.set(cacheKey, {
        data: scores,
        timestamp: Date.now()
      });

      return scores;
    } catch (error) {
      console.error('Failed to fetch user scores:', error);
      throw error;
    }
  }

  subscribeToLeaderboard(type = 'global', callback) {
    const listenerKey = `${type}_${Date.now()}`;

    const q = query(
      collection(db, 'gameRecords'),
      where('validation.validated', '==', true),
      where('validation.suspicious', '==', false),
      orderBy('gameData.totalScore', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = [];
      snapshot.forEach((doc) => {
        entries.push({
          id: doc.id,
          ...doc.data(),
          rank: entries.length + 1
        });
      });
      callback(entries);
    });

    this.listeners.set(listenerKey, unsubscribe);

    return () => {
      const unsub = this.listeners.get(listenerKey);
      if (unsub) {
        unsub();
        this.listeners.delete(listenerKey);
      }
    };
  }

  clearCache(pattern = null) {
    if (!pattern) {
      this.cache.clear();
    } else {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    }
  }

  async getLeaderboardPosition(userId) {
    try {
      // Get user's best score
      const userScores = await this.getUserBestScores(userId, 1);
      if (userScores.length === 0) return null;

      const userBestScore = userScores[0].gameData.totalScore;

      // Count how many scores are better
      const q = query(
        collection(db, 'gameRecords'),
        where('validation.validated', '==', true),
        where('validation.suspicious', '==', false),
        where('gameData.totalScore', '>', userBestScore)
      );

      const snapshot = await getDocs(q);
      return snapshot.size + 1;
    } catch (error) {
      console.error('Failed to get position:', error);
      return null;
    }
  }
}

export default new LeaderboardService();
```

### 4.3 Redux Integration

```javascript
// src/store/firebaseSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/firebase/auth.service';
import leaderboardService from '../services/firebase/leaderboard.service';

// Async thunks
export const signInAnonymously = createAsyncThunk(
  'firebase/signInAnonymously',
  async () => {
    const result = await authService.signInAnonymously();
    if (!result.success) throw new Error(result.error);
    return {
      uid: result.user.uid,
      displayName: result.user.displayName || 'Anonymous',
      isAnonymous: result.user.isAnonymous
    };
  }
);

export const submitGameScore = createAsyncThunk(
  'firebase/submitScore',
  async ({ gameData }, { getState }) => {
    const state = getState();
    const userId = state.firebase.user?.uid;
    const playerName = state.firebase.user?.displayName || 'Anonymous';

    if (!userId) throw new Error('User not authenticated');

    const result = await leaderboardService.submitScore(gameData, userId, playerName);
    if (!result.success) throw new Error(result.error);

    return result.recordId;
  }
);

export const fetchGlobalLeaderboard = createAsyncThunk(
  'firebase/fetchLeaderboard',
  async ({ pageSize = 50, pageToken = null }) => {
    return await leaderboardService.getGlobalLeaderboard(pageSize, pageToken);
  }
);

export const fetchUserScores = createAsyncThunk(
  'firebase/fetchUserScores',
  async (_, { getState }) => {
    const state = getState();
    const userId = state.firebase.user?.uid;
    if (!userId) return [];

    return await leaderboardService.getUserBestScores(userId);
  }
);

// Slice
const firebaseSlice = createSlice({
  name: 'firebase',
  initialState: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    leaderboard: {
      global: [],
      user: [],
      isLoading: false,
      error: null,
      nextPageToken: null,
      hasMore: false
    },
    submission: {
      isSubmitting: false,
      lastSubmissionId: null,
      error: null
    }
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearLeaderboardCache: (state) => {
      leaderboardService.clearCache();
    },
    resetSubmission: (state) => {
      state.submission = {
        isSubmitting: false,
        lastSubmissionId: null,
        error: null
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Authentication
      .addCase(signInAnonymously.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signInAnonymously.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signInAnonymously.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Score submission
      .addCase(submitGameScore.pending, (state) => {
        state.submission.isSubmitting = true;
        state.submission.error = null;
      })
      .addCase(submitGameScore.fulfilled, (state, action) => {
        state.submission.isSubmitting = false;
        state.submission.lastSubmissionId = action.payload;
      })
      .addCase(submitGameScore.rejected, (state, action) => {
        state.submission.isSubmitting = false;
        state.submission.error = action.error.message;
      })

      // Leaderboard fetching
      .addCase(fetchGlobalLeaderboard.pending, (state) => {
        state.leaderboard.isLoading = true;
        state.leaderboard.error = null;
      })
      .addCase(fetchGlobalLeaderboard.fulfilled, (state, action) => {
        state.leaderboard.isLoading = false;
        state.leaderboard.global = action.payload.entries;
        state.leaderboard.nextPageToken = action.payload.nextPageToken;
        state.leaderboard.hasMore = action.payload.hasMore;
      })
      .addCase(fetchGlobalLeaderboard.rejected, (state, action) => {
        state.leaderboard.isLoading = false;
        state.leaderboard.error = action.error.message;
      })

      // User scores
      .addCase(fetchUserScores.fulfilled, (state, action) => {
        state.leaderboard.user = action.payload;
      });
  }
});

export const { setUser, clearLeaderboardCache, resetSubmission } = firebaseSlice.actions;
export default firebaseSlice.reducer;
```

---

## 5. Implementation Steps

### 5.1 Phase 1: Firebase Setup (Day 1-2)

1. **Create Firebase Project**
   - Enable Authentication, Firestore, Functions
   - Configure security rules
   - Set up composite indexes

2. **Install Dependencies**
   ```bash
   npm install firebase
   npm install --save-dev firebase-tools
   ```

3. **Environment Configuration**
   ```env
   VITE_FIREBASE_API_KEY=xxx
   VITE_FIREBASE_AUTH_DOMAIN=xxx
   VITE_FIREBASE_PROJECT_ID=xxx
   VITE_FIREBASE_STORAGE_BUCKET=xxx
   VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
   VITE_FIREBASE_APP_ID=xxx
   VITE_FIREBASE_MEASUREMENT_ID=xxx
   VITE_GAME_VERSION=1.0.0
   ```

4. **Initialize Firebase Services**
   - Create config.js
   - Set up auth.service.js
   - Set up leaderboard.service.js

### 5.2 Phase 2: Redux Integration (Day 3-4)

1. **Create Firebase Slice**
   - Authentication state
   - Leaderboard state
   - Submission state

2. **Update Store Configuration**
   ```javascript
   // src/store/store.js
   import firebaseReducer from './firebaseSlice';

   export const store = configureStore({
     reducer: {
       game: gameReducer,
       team: teamReducer,
       bike: bikeReducer,
       player: playerReducer,
       firebase: firebaseReducer // Add this
     },
     middleware: (getDefaultMiddleware) =>
       getDefaultMiddleware({
         serializableCheck: {
           // Ignore Firebase timestamp warnings
           ignoredActions: ['firebase/submitScore/fulfilled'],
           ignoredPaths: ['firebase.user']
         }
       })
   });
   ```

3. **Create Hooks**
   ```javascript
   // src/hooks/useFirebase.js
   export const useAuth = () => {
     const dispatch = useDispatch();
     const { user, isAuthenticated, isLoading } = useSelector(state => state.firebase);

     const signIn = useCallback(async () => {
       await dispatch(signInAnonymously());
     }, [dispatch]);

     return { user, isAuthenticated, isLoading, signIn };
   };

   export const useLeaderboard = () => {
     const dispatch = useDispatch();
     const { leaderboard } = useSelector(state => state.firebase);

     const fetchLeaderboard = useCallback(async (options = {}) => {
       await dispatch(fetchGlobalLeaderboard(options));
     }, [dispatch]);

     return { ...leaderboard, fetchLeaderboard };
   };
   ```

### 5.3 Phase 3: UI Components (Day 5-6)

1. **Leaderboard Component**
   ```javascript
   // src/components/Leaderboard.jsx
   const Leaderboard = () => {
     const { global, isLoading, fetchLeaderboard } = useLeaderboard();

     useEffect(() => {
       fetchLeaderboard();
     }, []);

     // Render leaderboard UI
   };
   ```

2. **Score Submission Modal**
   ```javascript
   // src/components/ScoreSubmission.jsx
   const ScoreSubmission = ({ gameData }) => {
     const dispatch = useDispatch();
     const { isSubmitting, error } = useSelector(state => state.firebase.submission);

     const handleSubmit = async () => {
       await dispatch(submitGameScore({ gameData }));
     };

     // Render submission UI
   };
   ```

3. **Authentication Flow**
   - Auto sign-in anonymously on app load
   - Optional upgrade to email account
   - Persist auth state

### 5.4 Phase 4: Cloud Functions (Day 7-8)

1. **Score Validation Function**
   ```javascript
   // functions/index.js
   exports.validateGameRecord = functions.firestore
     .document('gameRecords/{recordId}')
     .onCreate(async (snap, context) => {
       const record = snap.data();
       const isValid = validateGameRecord(record);

       await snap.ref.update({
         'validation.validated': true,
         'validation.suspicious': !isValid
       });

       if (isValid) {
         // Update leaderboard collection
         await updateLeaderboard(record);
       }
     });
   ```

2. **Leaderboard Aggregation**
   ```javascript
   exports.updateLeaderboard = functions.pubsub
     .schedule('every 1 hours')
     .onRun(async (context) => {
       await aggregateLeaderboards();
       await cleanupOldRecords();
     });
   ```

3. **Anti-Cheat Monitoring**
   ```javascript
   exports.detectAnomalies = functions.firestore
     .document('gameRecords/{recordId}')
     .onCreate(async (snap, context) => {
       const record = snap.data();
       const anomalies = await detectStatisticalAnomalies(record);

       if (anomalies.length > 0) {
         await flagSuspiciousRecord(snap.ref, anomalies);
         await notifyAdmins(record, anomalies);
       }
     });
   ```

### 5.5 Phase 5: Testing & Optimization (Day 9-10)

1. **Security Testing**
   - Test security rules with Firebase emulator
   - Attempt common exploits
   - Verify rate limiting

2. **Performance Testing**
   - Load test with 1000+ records
   - Optimize queries
   - Implement pagination

3. **Integration Testing**
   - End-to-end score submission
   - Leaderboard updates
   - Offline handling

---

## 6. Performance Optimization

### 6.1 Caching Strategy

```javascript
// Client-side caching
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  invalidate(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}
```

### 6.2 Pagination Implementation

```javascript
// Infinite scroll for leaderboard
const useInfiniteLeaderboard = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageToken, setPageToken] = useState(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const result = await leaderboardService.getGlobalLeaderboard(20, pageToken);

    setEntries(prev => [...prev, ...result.entries]);
    setPageToken(result.nextPageToken);
    setHasMore(result.hasMore);
    setLoading(false);
  }, [loading, hasMore, pageToken]);

  return { entries, loadMore, loading, hasMore };
};
```

### 6.3 Optimistic Updates

```javascript
// Optimistic UI updates for better UX
const submitScoreOptimistic = (gameData) => {
  // Immediately show in UI
  dispatch(addOptimisticScore(gameData));

  // Submit to Firebase
  dispatch(submitGameScore({ gameData }))
    .unwrap()
    .catch(() => {
      // Rollback on failure
      dispatch(removeOptimisticScore(gameData));
      toast.error('Failed to submit score');
    });
};
```

---

## 7. Security Considerations

### 7.1 Client-Side Validation

```javascript
// src/utils/security.js
import CryptoJS from 'crypto-js';

export const calculateChecksum = (gameData) => {
  const dataString = JSON.stringify({
    completionTime: gameData.completionTime,
    totalScore: gameData.totalScore,
    distance: gameData.metrics.distance,
    teamConfig: gameData.teamConfiguration
  });

  return CryptoJS.SHA256(dataString).toString();
};

export const validateClientData = (gameData) => {
  const validations = [
    // Score range check
    () => gameData.totalScore >= 0 && gameData.totalScore <= 5000,

    // Time range check (6-24 hours)
    () => gameData.completionTime >= 21600 && gameData.completionTime <= 86400,

    // Distance check
    () => gameData.metrics.distance === 380,

    // Team size check
    () => {
      const teamSize = gameData.teamConfiguration.members.length;
      return teamSize >= 2 && teamSize <= 4;
    },

    // Score breakdown integrity
    () => {
      const breakdown = gameData.scoreBreakdown;
      const sum = Object.values(breakdown).reduce((a, b) => a + b, 0);
      return Math.abs(sum - gameData.totalScore) < 1;
    }
  ];

  return validations.every(validation => validation());
};
```

### 7.2 Server-Side Validation

```javascript
// Cloud Function validation
const serverValidation = {
  // Rate limiting check
  async checkRateLimit(userId) {
    const recentSubmissions = await db
      .collection('gameRecords')
      .where('userId', '==', userId)
      .where('timestamp', '>', new Date(Date.now() - 60000))
      .get();

    return recentSubmissions.size === 0;
  },

  // Pattern detection
  async detectPatterns(userId) {
    const userRecords = await db
      .collection('gameRecords')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    const scores = userRecords.docs.map(doc => doc.data().gameData.totalScore);

    // Check for suspicious patterns
    const isSuspicious = scores.every(score => score === scores[0]) || // All same
                        scores.every((s, i) => i === 0 || s > scores[i-1]); // Always increasing

    return !isSuspicious;
  },

  // Statistical anomaly detection
  async checkStatisticalAnomaly(gameData) {
    const allRecords = await db
      .collection('gameRecords')
      .where('validation.validated', '==', true)
      .get();

    const scores = allRecords.docs.map(doc => doc.data().gameData.totalScore);
    const mean = scores.reduce((a, b) => a + b) / scores.length;
    const stdDev = Math.sqrt(scores.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / scores.length);

    // Flag if score is > 3 standard deviations from mean
    return Math.abs(gameData.totalScore - mean) <= 3 * stdDev;
  }
};
```

---

## 8. Migration Strategy

### 8.1 Gradual Migration from localStorage

```javascript
// src/services/migration.js
export const migrateToFirebase = async () => {
  // Check for existing localStorage data
  const localLeaderboard = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);

  if (localLeaderboard) {
    const scores = JSON.parse(localLeaderboard);

    // Authenticate user
    const { user } = await authService.signInAnonymously();

    // Migrate scores
    for (const score of scores) {
      await leaderboardService.submitScore(
        score.gameData,
        user.uid,
        score.playerName || 'Migrated Player'
      );
    }

    // Clear localStorage after successful migration
    localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
  }
};
```

### 8.2 Dual Storage During Transition

```javascript
// Keep both systems running during transition
const hybridStorage = {
  async saveScore(gameData) {
    // Save to localStorage (fallback)
    saveToLocalStorage(gameData);

    // Try to save to Firebase
    if (authService.isAuthenticated()) {
      try {
        await leaderboardService.submitScore(gameData);
      } catch (error) {
        console.warn('Firebase save failed, using localStorage', error);
      }
    }
  },

  async getLeaderboard() {
    try {
      // Try Firebase first
      if (authService.isAuthenticated()) {
        return await leaderboardService.getGlobalLeaderboard();
      }
    } catch (error) {
      console.warn('Firebase fetch failed, using localStorage', error);
    }

    // Fallback to localStorage
    return getLocalLeaderboard();
  }
};
```

---

## 9. Testing Strategy

### 9.1 Unit Tests

```javascript
// src/services/__tests__/leaderboard.test.js
import { renderHook } from '@testing-library/react-hooks';
import { useLeaderboard } from '../../hooks/useFirebase';

describe('Leaderboard Service', () => {
  test('should validate score before submission', async () => {
    const invalidScore = {
      totalScore: 10000, // Too high
      completionTime: 100 // Too fast
    };

    const result = await leaderboardService.submitScore(invalidScore);
    expect(result.success).toBe(false);
  });

  test('should cache leaderboard data', async () => {
    const firstCall = await leaderboardService.getGlobalLeaderboard();
    const secondCall = await leaderboardService.getGlobalLeaderboard();

    // Second call should be from cache (instant)
    expect(secondCall).toEqual(firstCall);
  });

  test('should handle offline gracefully', async () => {
    // Simulate offline
    window.navigator.onLine = false;

    const result = await leaderboardService.getGlobalLeaderboard();
    expect(result).toBeDefined(); // Should return cached or empty data
  });
});
```

### 9.2 Integration Tests

```javascript
// src/integration/__tests__/firebase.test.js
describe('Firebase Integration', () => {
  test('end-to-end score submission', async () => {
    // 1. Authenticate
    await authService.signInAnonymously();

    // 2. Generate valid game data
    const gameData = generateValidGameData();

    // 3. Submit score
    const submission = await leaderboardService.submitScore(gameData);
    expect(submission.success).toBe(true);

    // 4. Verify in leaderboard
    const leaderboard = await leaderboardService.getGlobalLeaderboard();
    const submitted = leaderboard.entries.find(e => e.id === submission.recordId);
    expect(submitted).toBeDefined();
  });
});
```

---

## 10. Deployment Configuration

### 10.1 Firebase Hosting Setup

```json
// firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": {
    "source": "functions",
    "predeploy": "npm --prefix functions run build"
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "functions": {
      "port": 5001
    },
    "hosting": {
      "port": 5000
    }
  }
}
```

### 10.2 GitHub Actions CI/CD

```yaml
# .github/workflows/firebase-deploy.yml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}

      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only hosting
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

---

## Summary

This comprehensive plan provides a production-ready Firebase integration for the Cycling Game with:

✅ **Secure Architecture**: Multiple layers of validation and anti-cheat mechanisms
✅ **Performance Optimized**: Caching, pagination, and optimistic updates
✅ **Scalable Design**: Can handle thousands of concurrent users
✅ **Redux Integration**: Seamless integration with existing state management
✅ **Progressive Migration**: Gradual transition from localStorage
✅ **Comprehensive Testing**: Unit, integration, and security tests
✅ **Production Ready**: CI/CD pipeline and monitoring

The implementation follows React and Firebase best practices, ensuring maintainability, security, and excellent user experience.