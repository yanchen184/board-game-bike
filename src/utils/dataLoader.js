/**
 * 數據加載工具
 * 提供統一的數據訪問接口
 */

import charactersData from '../data/characters.json';
import equipmentData from '../data/equipment.json';
import formationsData from '../data/formations.json';
import eventsData from '../data/events.json';
import routeData from '../data/route.json';

/**
 * 獲取所有角色
 * @returns {Array} 角色列表
 */
export function getCharacters() {
  return charactersData.characters || [];
}

/**
 * 根據ID獲取角色
 * @param {string} id - 角色ID
 * @returns {Object|null} 角色數據
 */
export function getCharacterById(id) {
  const characters = getCharacters();
  return characters.find(char => char.id === id) || null;
}

/**
 * 根據類型獲取角色
 * @param {string} type - 角色類型
 * @returns {Array} 該類型的所有角色
 */
export function getCharactersByType(type) {
  const characters = getCharacters();
  return characters.filter(char => char.characterType === type);
}

/**
 * 獲取推薦角色組合
 * @param {string} strategy - 策略類型
 * @returns {Array} 推薦的角色組合
 */
export function getRecommendedTeam(strategy = 'balanced') {
  const characters = getCharacters();

  const strategies = {
    balanced: ['climber', 'sprinter', 'endurance'],
    climbing: ['climber', 'climber', 'endurance'],
    speed: ['sprinter', 'tt_specialist', 'allrounder'],
    endurance: ['endurance', 'endurance', 'support']
  };

  const targetTypes = strategies[strategy] || strategies.balanced;

  return targetTypes.map(type => {
    const typeCharacters = characters.filter(c => c.characterType === type);
    return typeCharacters[Math.floor(Math.random() * typeCharacters.length)];
  }).filter(Boolean);
}

/**
 * 獲取所有裝備
 * @returns {Object} 裝備數據（按類型分組）
 */
export function getEquipment() {
  return {
    frames: equipmentData.frames || [],
    wheelsets: equipmentData.wheelsets || [],
    drivetrains: equipmentData.drivetrains || []
  };
}

/**
 * 根據ID獲取裝備
 * @param {string} type - 裝備類型 (frame/wheelset/drivetrain)
 * @param {string} id - 裝備ID
 * @returns {Object|null} 裝備數據
 */
export function getEquipmentById(type, id) {
  const equipment = getEquipment();
  const typeEquipment = equipment[`${type}s`];

  if (!typeEquipment) return null;

  return typeEquipment.find(item => item.id === id) || null;
}

/**
 * 獲取推薦裝備組合
 * @param {string} budget - 預算等級 (low/medium/high)
 * @param {string} focus - 側重點 (speed/climbing/endurance)
 * @returns {Object} 推薦的裝備組合
 */
export function getRecommendedEquipment(budget = 'medium', focus = 'balanced') {
  const equipment = getEquipment();

  const budgetFilters = {
    low: item => item.tier <= 2,
    medium: item => item.tier >= 2 && item.tier <= 3,
    high: item => item.tier >= 3
  };

  const filter = budgetFilters[budget] || budgetFilters.medium;

  const focusScores = {
    speed: (item) => (item.speedBonus || 0) * 2 + (item.aeroBonus || 0),
    climbing: (item) => (item.climbingBonus || 0) * 2 + (item.weightReduction || 0),
    endurance: (item) => (item.durability || 0) * 2 + (item.comfortBonus || 0),
    balanced: (item) => (item.speedBonus || 0) + (item.climbingBonus || 0) + (item.durability || 0)
  };

  const scoreFunc = focusScores[focus] || focusScores.balanced;

  const selectBest = (items) => {
    const filtered = items.filter(filter);
    if (filtered.length === 0) return items[0];

    return filtered.reduce((best, current) => {
      return scoreFunc(current) > scoreFunc(best) ? current : best;
    });
  };

  return {
    frame: selectBest(equipment.frames),
    wheelset: selectBest(equipment.wheelsets),
    drivetrain: selectBest(equipment.drivetrains)
  };
}

/**
 * 計算裝備套裝效果
 * @param {Object} selectedEquipment - 選擇的裝備
 * @returns {Object} 套裝效果
 */
export function calculateSetBonus(selectedEquipment) {
  const { frame, wheelset, drivetrain } = selectedEquipment;

  const setBonus = {
    hasBonus: false,
    bonusType: null,
    bonusValue: 0,
    description: ''
  };

  // 檢查品牌套裝
  if (frame?.brand === wheelset?.brand && wheelset?.brand === drivetrain?.brand) {
    setBonus.hasBonus = true;
    setBonus.bonusType = 'brand';
    setBonus.bonusValue = 0.05;
    setBonus.description = `${frame.brand}全套裝備加成：所有屬性+5%`;
  }

  // 檢查等級套裝
  if (frame?.tier === wheelset?.tier && wheelset?.tier === drivetrain?.tier) {
    if (frame.tier >= 4) {
      setBonus.hasBonus = true;
      setBonus.bonusType = 'tier';
      setBonus.bonusValue = 0.08;
      setBonus.description = '高階裝備套裝：所有屬性+8%';
    }
  }

  // 檢查專項套裝
  const specializations = [
    frame?.specialization,
    wheelset?.specialization,
    drivetrain?.specialization
  ].filter(Boolean);

  const specializationCounts = specializations.reduce((acc, spec) => {
    acc[spec] = (acc[spec] || 0) + 1;
    return acc;
  }, {});

  Object.entries(specializationCounts).forEach(([spec, count]) => {
    if (count >= 2) {
      setBonus.hasBonus = true;
      setBonus.bonusType = 'specialization';
      setBonus.bonusValue = 0.1;
      setBonus.description = `${spec}專項套裝：相關屬性+10%`;
    }
  });

  return setBonus;
}

/**
 * 獲取所有隊形
 * @returns {Array} 隊形列表
 */
export function getFormations() {
  return formationsData.formations || [];
}

/**
 * 根據ID獲取隊形
 * @param {string} id - 隊形ID
 * @returns {Object|null} 隊形數據
 */
export function getFormationById(id) {
  const formations = getFormations();
  return formations.find(formation => formation.id === id) || null;
}

/**
 * 獲取適合的隊形
 * @param {Object} conditions - 條件（地形、天氣等）
 * @returns {Array} 推薦的隊形列表
 */
export function getRecommendedFormations(conditions = {}) {
  const formations = getFormations();
  const { terrain, teamSize, weather, strategy } = conditions;

  return formations
    .filter(formation => {
      // 根據團隊人數過濾
      if (teamSize && formation.requiredMembers) {
        if (teamSize < formation.requiredMembers.min || teamSize > formation.requiredMembers.max) {
          return false;
        }
      }

      // 根據地形過濾
      if (terrain && formation.bestTerrain) {
        if (!formation.bestTerrain.includes(terrain)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      // 根據策略評分
      let scoreA = 0;
      let scoreB = 0;

      if (strategy === 'aggressive') {
        scoreA += a.speedBonus || 0;
        scoreB += b.speedBonus || 0;
      } else if (strategy === 'conservative') {
        scoreA += a.staminaSaving || 0;
        scoreB += b.staminaSaving || 0;
      }

      return scoreB - scoreA;
    });
}

/**
 * 獲取所有事件
 * @returns {Array} 事件列表
 */
export function getEvents() {
  return eventsData.events || [];
}

/**
 * 根據ID獲取事件
 * @param {string} id - 事件ID
 * @returns {Object|null} 事件數據
 */
export function getEventById(id) {
  const events = getEvents();
  return events.find(event => event.id === id) || null;
}

/**
 * 根據類型獲取事件
 * @param {string} type - 事件類型
 * @returns {Array} 該類型的所有事件
 */
export function getEventsByType(type) {
  const events = getEvents();
  return events.filter(event => event.type === type);
}

/**
 * 獲取路線數據
 * @returns {Object} 路線數據
 */
export function getRoute() {
  return routeData;
}

/**
 * 獲取路段數據
 * @param {number} segmentIndex - 路段索引
 * @returns {Object|null} 路段數據
 */
export function getSegment(segmentIndex) {
  const route = getRoute();
  if (!route.segments || segmentIndex < 0 || segmentIndex >= route.segments.length) {
    return null;
  }
  return route.segments[segmentIndex];
}

/**
 * 根據距離獲取當前路段
 * @param {number} distance - 當前距離
 * @returns {Object|null} 當前路段數據
 */
export function getSegmentByDistance(distance) {
  const route = getRoute();
  if (!route.segments) return null;

  let accumulatedDistance = 0;
  for (const segment of route.segments) {
    accumulatedDistance += segment.distance;
    if (distance < accumulatedDistance) {
      return segment;
    }
  }

  return route.segments[route.segments.length - 1];
}

/**
 * 獲取補給站數據
 * @param {number} distance - 距離（可選）
 * @returns {Array|Object} 補給站列表或最近的補給站
 */
export function getSupplyStations(distance = null) {
  const route = getRoute();
  const stations = route.supplyStations || [];

  if (distance === null) {
    return stations;
  }

  // 找最近的補給站
  return stations.reduce((nearest, station) => {
    const currentDist = Math.abs(station.location - distance);
    const nearestDist = nearest ? Math.abs(nearest.location - distance) : Infinity;

    return currentDist < nearestDist ? station : nearest;
  }, null);
}

/**
 * 獲取里程碑
 * @returns {Array} 里程碑列表
 */
export function getMilestones() {
  const route = getRoute();
  return route.milestones || [];
}

/**
 * 獲取天氣模式
 * @param {string} season - 季節（可選）
 * @returns {Object} 天氣數據
 */
export function getWeatherPatterns(season = null) {
  const route = getRoute();
  const patterns = route.weatherPatterns || {};

  if (season && patterns.seasonal && patterns.seasonal[season]) {
    return patterns.seasonal[season];
  }

  return patterns.typical || [];
}

/**
 * 獲取難度分析
 * @returns {Object} 難度分析數據
 */
export function getDifficultyAnalysis() {
  const route = getRoute();
  return route.difficultyAnalysis || {};
}

/**
 * 獲取策略指南
 * @param {string} strategyType - 策略類型
 * @returns {Object} 策略指南
 */
export function getStrategyGuide(strategyType = null) {
  const route = getRoute();
  const guide = route.strategyGuide || {};

  if (strategyType && guide[strategyType]) {
    return guide[strategyType];
  }

  return guide;
}

/**
 * 獲取記錄數據
 * @returns {Object} 記錄數據
 */
export function getRecords() {
  const route = getRoute();
  return route.records || {};
}

/**
 * 驗證配置有效性
 * @param {Object} config - 配置對象
 * @returns {Object} 驗證結果
 */
export function validateConfiguration(config) {
  const errors = [];
  const warnings = [];

  // 驗證團隊配置
  if (config.team) {
    if (!config.team.members || config.team.members.length === 0) {
      errors.push('團隊必須至少有一名成員');
    }

    if (config.team.members && config.team.members.length > 6) {
      warnings.push('團隊成員過多可能影響協調性');
    }
  }

  // 驗證裝備配置
  if (config.equipment) {
    if (!config.equipment.frame) {
      errors.push('必須選擇車架');
    }

    if (!config.equipment.wheelset) {
      errors.push('必須選擇輪組');
    }

    if (!config.equipment.drivetrain) {
      errors.push('必須選擇傳動系統');
    }
  }

  // 驗證策略配置
  if (config.strategy) {
    const validFormations = getFormations().map(f => f.id);

    if (config.strategy.initialFormation && !validFormations.includes(config.strategy.initialFormation)) {
      errors.push('無效的初始隊形');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 獲取遊戲統計數據
 * @returns {Object} 統計數據
 */
export function getGameStatistics() {
  return {
    totalCharacters: getCharacters().length,
    totalEquipment: {
      frames: getEquipment().frames.length,
      wheelsets: getEquipment().wheelsets.length,
      drivetrains: getEquipment().drivetrains.length
    },
    totalFormations: getFormations().length,
    totalEvents: getEvents().length,
    routeDistance: getRoute().totalDistance,
    routeSegments: getRoute().segments?.length || 0,
    supplyStations: getRoute().supplyStations?.length || 0
  };
}

export default {
  getCharacters,
  getCharacterById,
  getCharactersByType,
  getRecommendedTeam,
  getEquipment,
  getEquipmentById,
  getRecommendedEquipment,
  calculateSetBonus,
  getFormations,
  getFormationById,
  getRecommendedFormations,
  getEvents,
  getEventById,
  getEventsByType,
  getRoute,
  getSegment,
  getSegmentByDistance,
  getSupplyStations,
  getMilestones,
  getWeatherPatterns,
  getDifficultyAnalysis,
  getStrategyGuide,
  getRecords,
  validateConfiguration,
  getGameStatistics
};
