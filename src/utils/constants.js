// Game Phase Constants
export const GAME_PHASES = {
  START: 'start',
  SETUP: 'setup',
  RACING: 'racing',
  RESULTS: 'results',
};

// Formation Types
export const FORMATION_TYPES = {
  SINGLE: 'single',
  DOUBLE: 'double',
  TRAIN: 'train',
};

// Formation Bonuses (wind resistance reduction)
export const FORMATION_BONUSES = {
  [FORMATION_TYPES.SINGLE]: 0.20, // 20% reduction
  [FORMATION_TYPES.DOUBLE]: 0.15, // 15% reduction
  [FORMATION_TYPES.TRAIN]: 0.25,  // 25% reduction
};

// Formation Penalties for uphill terrain
export const FORMATION_PENALTIES = {
  [FORMATION_TYPES.SINGLE]: 0,    // No penalty
  [FORMATION_TYPES.DOUBLE]: 0.05, // 5% speed penalty on uphill
  [FORMATION_TYPES.TRAIN]: 0.10,  // 10% speed penalty on uphill (harder to maintain tight formation)
};

// Stamina drain multipliers
export const STAMINA_DRAIN = {
  LEADER: 2.0,    // Leader drains 2x stamina (increased from 1.5x)
  FOLLOWER: 1.0,  // Followers drain normal stamina
  LOW_STAMINA_THRESHOLD: 30, // Auto-rotate when below 30%
  CRITICAL_THRESHOLD: 15,    // Performance penalty below 15%
};

// Stamina recovery rates (for followers)
export const STAMINA_RECOVERY = {
  BASE_RATE: 0.015,  // Base recovery: 0.015% per second = 54% per hour
  FORMATION_MULTIPLIER: 2.0, // Formation bonus multiplier (max 50% boost)
  MAX_RECOVERY_RATE: 0.025,  // Maximum recovery rate cap (90% per hour)
};

// Game Constants
export const TOTAL_DISTANCE = 380; // km (Taipei to Kaohsiung)
export const TIME_LIMIT = 24 * 60 * 60; // 24 hours in seconds
export const BUDGET_LIMIT = 5000; // Starting budget for team and equipment
export const MAX_TEAM_SIZE = 4;
export const MIN_TEAM_SIZE = 2;

// Character Types
export const CHARACTER_TYPES = {
  CLIMBER: 'climber',
  SPRINTER: 'sprinter',
  DOMESTIQUE: 'domestique',
  ALL_ROUNDER: 'allrounder',
};

// Weather Types
export const WEATHER_TYPES = {
  CLEAR: 'clear',
  WINDY: 'windy',
  RAINY: 'rainy',
};

// Terrain Types
export const TERRAIN_TYPES = {
  FLAT: 'flat',
  UPHILL: 'uphill',
  DOWNHILL: 'downhill',
};

// Event Types
export const EVENT_TYPES = {
  WEATHER_CHANGE: 'weather_change',
  MECHANICAL_FAILURE: 'mechanical_failure',
  SUPPLY_STATION: 'supply_station',
  ROAD_CONDITION: 'road_condition',
};

// Training Types
export const TRAINING_TYPES = {
  HIGH_INTENSITY: 'high_intensity',
  ENDURANCE: 'endurance',
  BALANCED: 'balanced',
};

// Route Variants
export const ROUTE_VARIANTS = {
  COASTAL: 'coastal',
  MOUNTAIN: 'mountain',
  MIXED: 'mixed',
};

// Achievement IDs
export const ACHIEVEMENTS = {
  FULL_TEAM: 'full_team_finish',
  UNDER_BUDGET: 'under_budget',
  FAST_TIME: 'fast_time',
  PERFECT_WEATHER: 'perfect_weather',
  NO_FAILURES: 'no_mechanical_failures',
  ENDURANCE_MASTER: 'endurance_master',
};

// LocalStorage Keys
export const STORAGE_KEYS = {
  GAME_STATE: 'cycling_game_state',
  PLAYER_PROFILE: 'cycling_game_player',
  LEADERBOARD: 'cycling_game_leaderboard',
  SETTINGS: 'cycling_game_settings',
};
