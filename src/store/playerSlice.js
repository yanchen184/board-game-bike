import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  bestTime: null, // Best completion time in seconds
  achievements: [], // Array of achievement IDs
  gamesPlayed: 0,
  gamesCompleted: 0,
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    difficulty: 'normal', // 'easy', 'normal', 'hard'
  },
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPlayerName: (state, action) => {
      state.name = action.payload;
    },

    updateBestTime: (state, action) => {
      if (state.bestTime === null || action.payload < state.bestTime) {
        state.bestTime = action.payload;
      }
    },

    addAchievement: (state, action) => {
      if (!state.achievements.includes(action.payload)) {
        state.achievements.push(action.payload);
      }
    },

    incrementGamesPlayed: state => {
      state.gamesPlayed += 1;
    },

    incrementGamesCompleted: state => {
      state.gamesCompleted += 1;
    },

    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    resetPlayer: () => initialState,
  },
});

// Actions
export const {
  setPlayerName,
  updateBestTime,
  addAchievement,
  incrementGamesPlayed,
  incrementGamesCompleted,
  updateSettings,
  resetPlayer,
} = playerSlice.actions;

// Selectors
export const selectPlayerProfile = state => ({
  name: state.player.name,
  bestTime: state.player.bestTime,
  gamesPlayed: state.player.gamesPlayed,
  gamesCompleted: state.player.gamesCompleted,
  completionRate:
    state.player.gamesPlayed > 0
      ? (state.player.gamesCompleted / state.player.gamesPlayed) * 100
      : 0,
});

export const selectAchievements = state => state.player.achievements;
export const selectSettings = state => state.player.settings;

export default playerSlice.reducer;
