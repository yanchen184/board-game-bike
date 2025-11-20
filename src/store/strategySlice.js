import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // 節奏策略
  paceStrategy: 'balanced', // 'conservative' | 'balanced' | 'aggressive'

  // 補給策略
  supplyStrategy: 'quick', // 'skip' | 'quick' | 'full'

  // 爬坡策略
  climbingStrategy: 'single', // 'single' | 'double' | 'maintain'

  // 機械故障策略
  mechanicalStrategy: 'quick_fix', // 'quick_fix' | 'thorough_repair' | 'continue'

  // 體力輪替閾值
  rotationThreshold: 30, // %
};

const strategySlice = createSlice({
  name: 'strategy',
  initialState,
  reducers: {
    setStrategy: (state, action) => {
      return { ...state, ...action.payload };
    },

    setPaceStrategy: (state, action) => {
      state.paceStrategy = action.payload;
    },

    setSupplyStrategy: (state, action) => {
      state.supplyStrategy = action.payload;
    },

    setClimbingStrategy: (state, action) => {
      state.climbingStrategy = action.payload;
    },

    setMechanicalStrategy: (state, action) => {
      state.mechanicalStrategy = action.payload;
    },

    setRotationThreshold: (state, action) => {
      state.rotationThreshold = action.payload;
    },

    resetStrategy: () => initialState,
  },
});

export const {
  setStrategy,
  setPaceStrategy,
  setSupplyStrategy,
  setClimbingStrategy,
  setMechanicalStrategy,
  setRotationThreshold,
  resetStrategy,
} = strategySlice.actions;

// Selectors
export const selectStrategy = state => state.strategy;
export const selectPaceStrategy = state => state.strategy.paceStrategy;
export const selectSupplyStrategy = state => state.strategy.supplyStrategy;
export const selectClimbingStrategy = state => state.strategy.climbingStrategy;
export const selectMechanicalStrategy = state => state.strategy.mechanicalStrategy;
export const selectRotationThreshold = state => state.strategy.rotationThreshold;

export default strategySlice.reducer;
