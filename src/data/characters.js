import { CHARACTER_TYPES } from '../utils/constants';

// Character type definitions based on PLANNING.md
export const characterTypes = {
  [CHARACTER_TYPES.CLIMBER]: {
    id: 'climber',
    name: '爬坡手',
    type: CHARACTER_TYPES.CLIMBER,
    typeLabel: '爬坡專家',
    baseStats: {
      speed: 70,
      stamina: 85,
      teamwork: 60,
      climbing: 95,
      sprinting: 50,
      recovery: 75,
    },
    specialty: '山路加成 +25%',
    cost: 1000,
    description: '擅長爬坡路段，在上坡時速度衰減較少，爬坡專家',
    avatar: '🚵',
    skills: ['山路加速', '高海拔適應', '爬坡耐力'],
  },

  [CHARACTER_TYPES.SPRINTER]: {
    id: 'sprinter',
    name: '衝刺手',
    type: CHARACTER_TYPES.SPRINTER,
    typeLabel: '衝刺專家',
    baseStats: {
      speed: 100,
      stamina: 60,
      teamwork: 50,
      climbing: 60,
      sprinting: 95,
      recovery: 65,
    },
    specialty: '平路加成 +25%',
    cost: 1300,
    description: '在平坦路段速度最快，適合平路衝刺',
    avatar: '🚴',
    skills: ['平路衝刺', '爆發力'],
  },

  [CHARACTER_TYPES.DOMESTIQUE]: {
    id: 'domestique',
    name: '破風手',
    type: CHARACTER_TYPES.DOMESTIQUE,
    typeLabel: '破風專家',
    baseStats: {
      speed: 75,
      stamina: 90,
      teamwork: 100,
      climbing: 65,
      sprinting: 65,
      recovery: 85,
    },
    specialty: '團隊體力消耗 -12%',
    cost: 1400,
    description: '為團隊破風，減少風阻，提升團隊效率',
    avatar: '🚴‍♂️',
    skills: ['破風掩護', '團隊協作', '耐力支援'],
  },

  [CHARACTER_TYPES.ALL_ROUNDER]: {
    id: 'allrounder',
    name: '全能選手',
    type: CHARACTER_TYPES.ALL_ROUNDER,
    typeLabel: '全能型',
    baseStats: {
      speed: 75,
      stamina: 75,
      teamwork: 75,
      climbing: 75,
      sprinting: 75,
      recovery: 75,
    },
    specialty: '適應各種路況',
    cost: 1000,
    description: '均衡發展，能適應各種路況和情況',
    avatar: '🚵‍♀️',
    skills: ['全面適應', '穩定輸出'],
  },
};

// Convert to array for easy iteration
export const charactersArray = Object.values(characterTypes);

// Helper function to get character by ID
export const getCharacterById = id => {
  return charactersArray.find(char => char.id === id);
};

// Helper function to get character by type
export const getCharacterByType = type => {
  return characterTypes[type];
};
