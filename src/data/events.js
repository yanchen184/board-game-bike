import { EVENT_TYPES, WEATHER_TYPES } from '../utils/constants';

// Event templates for random events during race
export const eventTemplates = [
  // Weather Events
  {
    id: 'weather_tailwind',
    type: EVENT_TYPES.WEATHER_CHANGE,
    name: '順風',
    description: '風向轉變，吹起順風！',
    probability: 0.15,
    effects: {
      speedModifier: 1.15, // 15% speed boost
      staminaDrain: 0.9, // 10% less stamina drain
    },
    duration: 600, // 10 minutes
    icon: '🌬️',
  },
  {
    id: 'weather_headwind',
    type: EVENT_TYPES.WEATHER_CHANGE,
    name: '逆風',
    description: '強烈逆風來襲，前進困難！',
    probability: 0.12,
    effects: {
      speedModifier: 0.85, // 15% speed reduction
      staminaDrain: 1.2, // 20% more stamina drain
    },
    duration: 900, // 15 minutes
    icon: '💨',
  },
  {
    id: 'weather_rain',
    type: EVENT_TYPES.WEATHER_CHANGE,
    name: '下雨',
    description: '天空下起雨來，路面濕滑',
    probability: 0.1,
    effects: {
      speedModifier: 0.9, // 10% slower
      staminaDrain: 1.1,
      moraleChange: -5,
    },
    duration: 1200, // 20 minutes
    icon: '🌧️',
  },
  {
    id: 'weather_clear',
    type: EVENT_TYPES.WEATHER_CHANGE,
    name: '天氣放晴',
    description: '雨過天晴，太陽露臉！',
    probability: 0.08,
    effects: {
      moraleChange: 10,
      staminaDrain: 0.95,
    },
    duration: 1800, // 30 minutes
    icon: '☀️',
  },

  // Mechanical Failures
  {
    id: 'mechanical_puncture',
    type: EVENT_TYPES.MECHANICAL_FAILURE,
    name: '爆胎',
    description: '輪胎爆胎了！需要停下來更換',
    probability: 0.08,
    effects: {
      timeDelay: 180, // 3 minutes to fix
      moraleChange: -10,
    },
    choices: [
      {
        label: '快速補胎',
        description: '快速修補，但可能不夠牢靠',
        effects: { timeDelay: 120, reliability: 0.7 },
      },
      {
        label: '仔細更換',
        description: '花時間仔細更換新胎',
        effects: { timeDelay: 240, reliability: 1.0 },
      },
    ],
    icon: '🔧',
  },
  {
    id: 'mechanical_chain',
    type: EVENT_TYPES.MECHANICAL_FAILURE,
    name: '鏈條脫落',
    description: '鏈條脫落，需要重新裝上',
    probability: 0.06,
    effects: {
      timeDelay: 60, // 1 minute
      moraleChange: -5,
    },
    icon: '⚙️',
  },
  {
    id: 'mechanical_brake',
    type: EVENT_TYPES.MECHANICAL_FAILURE,
    name: '煞車異響',
    description: '煞車發出異響，可能需要調整',
    probability: 0.05,
    effects: {
      speedModifier: 0.95,
      choices: [
        {
          label: '停下調整',
          effects: { timeDelay: 300, speedModifier: 1.0 },
        },
        {
          label: '繼續前進',
          effects: { timeDelay: 0, speedModifier: 0.9 },
        },
      ],
    },
    icon: '🔧',
  },

  // Supply Station Events
  {
    id: 'supply_station_rest',
    type: EVENT_TYPES.SUPPLY_STATION,
    name: '補給站',
    description: '到達補給站，可以休息補充體力',
    probability: 1.0, // Triggered by location
    choices: [
      {
        label: '快速補給 (2分鐘)',
        description: '快速補充水分和能量',
        effects: {
          timeDelay: 120,
          staminaRestore: 15,
          moraleChange: 5,
        },
      },
      {
        label: '完整休息 (5分鐘)',
        description: '充分休息，恢復體力',
        effects: {
          timeDelay: 300,
          staminaRestore: 30,
          moraleChange: 15,
        },
      },
      {
        label: '跳過不停',
        description: '保持節奏，不停站',
        effects: {
          timeDelay: 0,
          moraleChange: -5,
        },
      },
    ],
    icon: '🏪',
  },

  // Road Condition Events
  {
    id: 'road_smooth',
    type: EVENT_TYPES.ROAD_CONDITION,
    name: '路面良好',
    description: '前方路況極佳，騎乘順暢！',
    probability: 0.1,
    effects: {
      speedModifier: 1.1,
      moraleChange: 5,
    },
    duration: 600,
    icon: '🛣️',
  },
  {
    id: 'road_rough',
    type: EVENT_TYPES.ROAD_CONDITION,
    name: '路面顛簸',
    description: '路面狀況不佳，需要小心騎乘',
    probability: 0.08,
    effects: {
      speedModifier: 0.9,
      staminaDrain: 1.15,
      moraleChange: -5,
    },
    duration: 900,
    icon: '⚠️',
  },
  {
    id: 'road_traffic',
    type: EVENT_TYPES.ROAD_CONDITION,
    name: '車流量大',
    description: '車流量增加，需要謹慎騎乘',
    probability: 0.07,
    effects: {
      speedModifier: 0.85,
      moraleChange: -3,
    },
    duration: 600,
    icon: '🚗',
  },

  // Motivational Events
  {
    id: 'morale_cheering',
    type: 'morale_boost',
    name: '路人加油',
    description: '路邊民眾為你們加油打氣！',
    probability: 0.1,
    effects: {
      moraleChange: 15,
      staminaDrain: 0.9,
    },
    duration: 300,
    icon: '👏',
  },
  {
    id: 'morale_milestone',
    type: 'morale_boost',
    name: '里程碑達成',
    description: '完成重要里程碑，士氣大增！',
    probability: 0.05,
    effects: {
      moraleChange: 20,
      staminaRestore: 10,
    },
    icon: '🎯',
  },
];

// Helper functions
export const getEventByType = type => {
  return eventTemplates.filter(event => event.type === type);
};

export const getRandomEvent = (currentConditions = {}) => {
  const { distance = 0, weather = 'clear', bikeCondition = 100 } = currentConditions;

  // Filter events based on conditions
  let availableEvents = eventTemplates.filter(event => {
    // Don't trigger supply station events randomly
    if (event.type === EVENT_TYPES.SUPPLY_STATION) return false;

    // Mechanical failures less likely with better bike condition
    if (event.type === EVENT_TYPES.MECHANICAL_FAILURE) {
      return Math.random() < event.probability * (1 - bikeCondition / 200);
    }

    return Math.random() < event.probability;
  });

  if (availableEvents.length === 0) return null;

  // Return random event from available
  return availableEvents[Math.floor(Math.random() * availableEvents.length)];
};

export const getSupplyStationEvent = () => {
  return eventTemplates.find(e => e.id === 'supply_station_rest');
};
