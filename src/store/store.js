import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';
import teamReducer from './teamSlice';
import bikeReducer from './bikeSlice';
import playerReducer from './playerSlice';
import { loadGameState, saveGameState } from '../services/storage';

// Load persisted state
const persistedState = loadGameState();

// Debounce helper for saving
let saveTimeout = null;
const debouncedSave = (state) => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    saveGameState(state);
  }, 1000); // Save 1 second after last change
};

export const store = configureStore({
  reducer: {
    game: gameReducer,
    team: teamReducer,
    bike: bikeReducer,
    player: playerReducer,
  },
  preloadedState: persistedState,
});

// Subscribe to store changes and auto-save
store.subscribe(() => {
  const state = store.getState();
  // Only save if game is in progress or setup
  if (state.game.phase !== 'start' && state.game.phase !== 'results') {
    debouncedSave(state);
  }
});

export default store;
