import { createSlice } from '@reduxjs/toolkit';
import { GAME_PHASES, WEATHER_TYPES, TOTAL_DISTANCE } from '../utils/constants';

const initialState = {
  phase: GAME_PHASES.START,
  currentDistance: 0,
  totalDistance: TOTAL_DISTANCE,
  timeElapsed: 0, // seconds
  speed: 0, // km/h
  weather: {
    type: WEATHER_TYPES.CLEAR,
    windDirection: 0, // degrees
    windSpeed: 0, // km/h
  },
  events: [], // Array of { id, type, timestamp, data }
  isPaused: false,
  isComplete: false,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setPhase: (state, action) => {
      state.phase = action.payload;
    },

    updateDistance: (state, action) => {
      // Direct mutation OK with Immer
      state.currentDistance += action.payload;

      // Check completion
      if (state.currentDistance >= state.totalDistance) {
        state.phase = GAME_PHASES.RESULTS;
        state.isComplete = true;
      }
    },

    updateTime: (state, action) => {
      state.timeElapsed += action.payload;
    },

    updateSpeed: (state, action) => {
      state.speed = action.payload;
    },

    setWeather: (state, action) => {
      state.weather = { ...state.weather, ...action.payload };
    },

    addEvent: (state, action) => {
      // PATTERN: Push to array directly (Immer)
      state.events.push({
        id: Date.now(),
        timestamp: state.timeElapsed,
        ...action.payload,
      });

      // GOTCHA: Limit event history to last 50 to prevent memory bloat
      if (state.events.length > 50) {
        state.events.shift();
      }
    },

    togglePause: state => {
      state.isPaused = !state.isPaused;
    },

    resetGame: () => initialState,
  },
});

// Actions
export const {
  setPhase,
  updateDistance,
  updateTime,
  updateSpeed,
  setWeather,
  addEvent,
  togglePause,
  resetGame,
} = gameSlice.actions;

// Selectors
export const selectGamePhase = state => state.game.phase;
export const selectProgress = state => state.game.currentDistance / state.game.totalDistance;
export const selectCurrentStats = state => ({
  distance: state.game.currentDistance,
  totalDistance: state.game.totalDistance,
  time: state.game.timeElapsed,
  speed: state.game.speed,
  weather: state.game.weather,
  isPaused: state.game.isPaused,
  isComplete: state.game.isComplete,
});
export const selectEvents = state => state.game.events;

export default gameSlice.reducer;
