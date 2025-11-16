import { createSlice } from '@reduxjs/toolkit';
import { BUDGET_LIMIT } from '../utils/constants';

const initialState = {
  frame: null, // { id, name, weight, aero, cost }
  wheels: null,
  gears: null,
  accessories: [],
  totalWeight: 0,
  aeroDynamics: 0,
  totalCost: 0,
  budget: BUDGET_LIMIT,
};

const calculateBikeStats = state => {
  const parts = [state.frame, state.wheels, state.gears].filter(Boolean);

  // Calculate total weight
  state.totalWeight = parts.reduce((sum, part) => sum + (part.weight || 0), 0);

  // Aero is weighted average (frame most important, then wheels, then gears)
  state.aeroDynamics =
    ((state.frame?.aero || 0) * 0.5 +
      (state.wheels?.aero || 0) * 0.35 +
      (state.gears?.aero || 0) * 0.15) /
    0.9; // Normalize to 0-100 scale

  // Calculate total cost
  state.totalCost =
    parts.reduce((sum, part) => sum + (part.cost || 0), 0) +
    state.accessories.reduce((sum, acc) => sum + (acc.cost || 0), 0);
};

const bikeSlice = createSlice({
  name: 'bike',
  initialState,
  reducers: {
    selectFrame: (state, action) => {
      state.frame = action.payload;
      calculateBikeStats(state);
    },

    selectWheels: (state, action) => {
      state.wheels = action.payload;
      calculateBikeStats(state);
    },

    selectGears: (state, action) => {
      state.gears = action.payload;
      calculateBikeStats(state);
    },

    addAccessory: (state, action) => {
      state.accessories.push(action.payload);
      calculateBikeStats(state);
    },

    removeAccessory: (state, action) => {
      state.accessories = state.accessories.filter(acc => acc.id !== action.payload);
      calculateBikeStats(state);
    },

    resetBike: () => initialState,
  },
});

// Actions
export const {
  selectFrame,
  selectWheels,
  selectGears,
  addAccessory,
  removeAccessory,
  resetBike,
} = bikeSlice.actions;

// Selectors
export const selectBikeStats = state => ({
  totalWeight: state.bike.totalWeight,
  aeroDynamics: state.bike.aeroDynamics,
  totalCost: state.bike.totalCost,
  remainingBudget: state.bike.budget - state.bike.totalCost,
});

export const selectBikeParts = state => ({
  frame: state.bike.frame,
  wheels: state.bike.wheels,
  gears: state.bike.gears,
  accessories: state.bike.accessories,
});

export default bikeSlice.reducer;
