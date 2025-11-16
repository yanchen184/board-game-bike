import { createSlice } from '@reduxjs/toolkit';
import { FORMATION_TYPES } from '../utils/constants';

const initialState = {
  members: [], // Array of character objects
  formation: FORMATION_TYPES.SINGLE,
  currentLeader: 0, // Index of current leader
  morale: 100, // 0-100
  averageStamina: 100, // 0-100
};

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    addMember: (state, action) => {
      state.members.push(action.payload);
    },

    removeMember: (state, action) => {
      state.members = state.members.filter(member => member.id !== action.payload);
      // Reset leader index if needed
      if (state.currentLeader >= state.members.length) {
        state.currentLeader = 0;
      }
    },

    setFormation: (state, action) => {
      state.formation = action.payload;
    },

    updateMorale: (state, action) => {
      state.morale = Math.max(0, Math.min(100, state.morale + action.payload));
    },

    updateStamina: (state, action) => {
      // Update individual member stamina
      const { memberIndex, value } = action.payload;
      if (state.members[memberIndex]) {
        state.members[memberIndex].currentStamina = Math.max(0, Math.min(100, value));
      }

      // Recalculate average
      if (state.members.length > 0) {
        state.averageStamina =
          state.members.reduce((sum, m) => sum + (m.currentStamina || 100), 0) /
          state.members.length;
      }
    },

    updateAllStamina: (state, action) => {
      // Update all members' stamina
      state.members.forEach((member, index) => {
        const newStamina = (member.currentStamina || 100) + action.payload;
        state.members[index].currentStamina = Math.max(0, Math.min(100, newStamina));
      });

      // Recalculate average
      if (state.members.length > 0) {
        state.averageStamina =
          state.members.reduce((sum, m) => sum + (m.currentStamina || 100), 0) /
          state.members.length;
      }
    },

    rotateLead: state => {
      // Find next leader with highest stamina
      let maxStamina = -1;
      let nextLeader = state.currentLeader;

      state.members.forEach((member, index) => {
        const stamina = member.currentStamina || 100;
        if (stamina > maxStamina) {
          maxStamina = stamina;
          nextLeader = index;
        }
      });

      state.currentLeader = nextLeader;
    },

    resetTeam: () => initialState,
  },
});

// Actions
export const {
  addMember,
  removeMember,
  setFormation,
  updateMorale,
  updateStamina,
  updateAllStamina,
  rotateLead,
  resetTeam,
} = teamSlice.actions;

// Selectors
export const selectTeamMembers = state => state.team.members;
export const selectFormation = state => state.team.formation;
export const selectCurrentLeader = state => state.team.currentLeader;
export const selectTeamStats = state => ({
  morale: state.team.morale,
  averageStamina: state.team.averageStamina,
  teamSize: state.team.members.length,
});

export default teamSlice.reducer;
