/**
 * 遊戲核心計算引擎
 * 實作所有遊戲機制的計算公式
 */

/**
 * 計算有效速度
 * @param {Object} params - 速度計算參數
 * @param {number} params.characterSpeed - 角色基礎速度 (60-100)
 * @param {number} params.equipmentBonus - 裝備加成 (-0.2 ~ +0.3)
 * @param {string} params.terrainFactor - 地形類型
 * @param {number} params.staminaLevel - 當前體力百分比 (0-100)
 * @param {string} params.formationType - 隊形類型
 * @param {string} params.positionInFormation - 在隊形中的位置
 * @param {string} params.weatherCondition - 天氣狀況
 * @param {Array} params.specialAbilities - 特殊能力啟動狀態
 * @param {number} params.eventModifiers - 事件修正值
 * @returns {number} 有效速度 (km/h)
 */
export function calculateEffectiveSpeed(params) {
  const {
    characterSpeed = 80,
    equipmentBonus = 0,
    terrainFactor = 'flat',
    staminaLevel = 100,
    formationType = 'solo',
    positionInFormation = 'any',
    weatherCondition = 'clear',
    specialAbilities = [],
    eventModifiers = 0
  } = params;

  // 步驟1: 計算基礎速度
  let baseSpeed = characterSpeed * (1 + equipmentBonus);

  // 步驟2: 應用地形影響
  const terrainMultiplier = getTerrainMultiplier(terrainFactor);
  baseSpeed *= terrainMultiplier;

  // 步驟3: 計算體力影響（非線性）
  const staminaMultiplier = calculateStaminaEffect(staminaLevel);
  baseSpeed *= staminaMultiplier;

  // 步驟4: 應用隊形加成
  const formationBonus = getFormationBonus(formationType, positionInFormation);
  baseSpeed *= (1 + formationBonus);

  // 步驟5: 天氣影響
  const weatherMultiplier = getWeatherEffect(weatherCondition);
  baseSpeed *= weatherMultiplier;

  // 步驟6: 特殊能力加成
  const abilityBonus = calculateAbilityBonus(specialAbilities);
  baseSpeed *= (1 + abilityBonus);

  // 步驟7: 事件修正
  baseSpeed *= (1 + eventModifiers);

  // 步驟8: 最終限制（最低10km/h，最高50km/h）
  return Math.max(10, Math.min(50, baseSpeed));
}

/**
 * 獲取地形影響係數
 * @param {string} terrain - 地形類型
 * @returns {number} 地形影響係數
 */
export function getTerrainMultiplier(terrain) {
  const terrainEffects = {
    flat: 1.0,
    slight_uphill: 0.85,
    uphill: 0.70,
    steep_uphill: 0.55,
    extreme_uphill: 0.40,
    slight_downhill: 1.15,
    downhill: 1.25,
    steep_downhill: 1.35,
    technical: 0.80,
    rolling: 0.90,
    climbing: 0.60,
    descending_to_flat: 1.10,
    flat_undulating: 0.95,
    flat_to_hills: 0.85
  };

  return terrainEffects[terrain] || 1.0;
}

/**
 * 計算體力影響（非線性衰減）
 * @param {number} stamina - 體力百分比 (0-100)
 * @returns {number} 體力影響係數
 */
export function calculateStaminaEffect(stamina) {
  if (stamina >= 80) {
    return 1.0;
  } else if (stamina >= 60) {
    return 1.0 - (80 - stamina) * 0.0025;
  } else if (stamina >= 40) {
    return 0.95 - (60 - stamina) * 0.005;
  } else if (stamina >= 20) {
    return 0.85 - (40 - stamina) * 0.0075;
  } else {
    return Math.max(0.50, 0.70 - (20 - stamina) * 0.015);
  }
}

/**
 * 獲取隊形加成
 * @param {string} formation - 隊形類型
 * @param {string} position - 位置
 * @returns {number} 隊形速度加成
 */
export function getFormationBonus(formation, position) {
  const bonuses = {
    solo: { any: 0 },
    single_line: {
      lead: 0,
      second: 0.20,
      third: 0.25,
      last: 0.30
    },
    side_by_side: {
      left: 0.10,
      right: 0.15
    },
    double_paceline: {
      leadA: 0.05,
      leadB: 0.05,
      followA: 0.18,
      followB: 0.18
    },
    echelon: {
      front: 0,
      protected: 0.35
    },
    train: {
      lead: 0,
      guard: 0.15,
      protected: 0.40
    },
    diamond: {
      front: 0,
      side: 0.20,
      back: 0.25
    }
  };

  return bonuses[formation]?.[position] || 0;
}

/**
 * 獲取天氣影響係數
 * @param {string} weather - 天氣狀況
 * @returns {number} 天氣影響係數
 */
export function getWeatherEffect(weather) {
  const weatherEffects = {
    clear: 1.0,
    sunny: 1.0,
    partly_cloudy: 0.98,
    cloudy: 0.95,
    headwind: 0.75,
    tailwind: 1.15,
    sidewind: 0.85,
    rain: 0.80,
    storm: 0.60,
    hot: 0.90,
    cold: 0.92,
    hot_sunny: 0.88
  };

  return weatherEffects[weather] || 1.0;
}

/**
 * 計算特殊能力加成
 * @param {Array} abilities - 啟動的特殊能力列表
 * @returns {number} 能力加成係數
 */
export function calculateAbilityBonus(abilities) {
  let bonus = 0;

  if (!Array.isArray(abilities)) return bonus;

  abilities.forEach(ability => {
    switch (ability) {
      case 'mountain_acceleration':
        bonus += 0.15;
        break;
      case 'sprint_burst':
        bonus += 0.20;
        break;
      case 'endurance_boost':
        bonus += 0.10;
        break;
      case 'team_leader':
        bonus += 0.08;
        break;
      case 'aero_specialist':
        bonus += 0.12;
        break;
      default:
        break;
    }
  });

  return bonus;
}

/**
 * 計算體力消耗
 * @param {Object} params - 消耗計算參數
 * @returns {number} 體力消耗百分比
 */
export function calculateStaminaConsumption(params) {
  const {
    distance = 1,
    speed = 25,
    terrain = 'flat',
    formation = 'solo',
    position = 'any',
    weather = 'clear',
    bikeWeight = 7,
    characterEndurance = 70,
    isLeading = false
  } = params;

  // 基礎消耗率（每公里消耗的體力百分比）
  let baseConsumptionRate = 0.3;

  // 速度影響（速度越快消耗越大，非線性）
  const speedFactor = Math.pow(speed / 25, 1.5);
  baseConsumptionRate *= speedFactor;

  // 地形倍率
  const terrainMultipliers = {
    flat: 1.0,
    slight_uphill: 1.3,
    uphill: 1.8,
    steep_uphill: 2.5,
    extreme_uphill: 3.0,
    downhill: 0.3,
    slight_downhill: 0.5,
    technical: 1.3,
    rolling: 1.2,
    climbing: 2.2,
    descending_to_flat: 0.4,
    flat_undulating: 1.1,
    flat_to_hills: 1.4
  };
  baseConsumptionRate *= (terrainMultipliers[terrain] || 1.0);

  // 隊形和位置影響
  const formationSaving = getFormationStaminaSaving(formation, position);
  baseConsumptionRate *= (1 - formationSaving);

  // 領騎額外消耗
  if (isLeading) {
    baseConsumptionRate *= 1.5;
  }

  // 天氣影響
  const weatherMultipliers = {
    clear: 1.0,
    sunny: 1.0,
    headwind: 1.4,
    tailwind: 0.8,
    rain: 1.2,
    hot: 1.3,
    hot_sunny: 1.35,
    cold: 1.1
  };
  baseConsumptionRate *= (weatherMultipliers[weather] || 1.0);

  // 車重影響（每公斤增加1%消耗）
  const weightPenalty = 1 + ((bikeWeight - 7) * 0.01);
  baseConsumptionRate *= Math.max(0.9, weightPenalty);

  // 角色耐力減免
  const enduranceBonus = 1 - (characterEndurance / 100 * 0.3);
  baseConsumptionRate *= enduranceBonus;

  // 計算總消耗
  const totalConsumption = distance * baseConsumptionRate;

  return Math.min(100, Math.max(0, totalConsumption));
}

/**
 * 獲取隊形體力節省
 * @param {string} formation - 隊形類型
 * @param {string} position - 位置
 * @returns {number} 體力節省百分比
 */
export function getFormationStaminaSaving(formation, position) {
  const savings = {
    solo: { any: 0 },
    side_by_side: { left: 0.1, right: 0.15 },
    single_line: {
      lead: 0,
      second: 0.20,
      third: 0.25,
      last: 0.30
    },
    train: {
      lead: 0,
      guard: 0.15,
      protected: 0.40
    },
    double_paceline: {
      leadA: 0.05,
      leadB: 0.05,
      followA: 0.18,
      followB: 0.18
    },
    diamond: {
      front: 0,
      side: 0.20,
      back: 0.25
    },
    echelon: {
      front: 0,
      protected: 0.35
    }
  };

  return savings[formation]?.[position] || 0;
}

/**
 * 計算體力恢復速度
 * @param {Object} params - 恢復計算參數
 * @returns {number} 每分鐘恢復的體力百分比
 */
export function calculateRecoveryRate(params) {
  const {
    baseRecovery = 70,
    currentSpeed = 0,
    isResting = false,
    hasSupplies = false,
    teamSupport = 50,
    morale = 70,
    weather = 'clear',
    restDuration = 0
  } = params;

  // 基礎恢復率（每分鐘恢復的體力百分比）
  let recoveryRate = baseRecovery / 100;

  // 活動狀態影響
  if (isResting) {
    // 休息時的恢復（遞減效應）
    const restEfficiency = Math.log10(restDuration + 1) / Math.log10(11);
    recoveryRate *= (2 + restEfficiency);
  } else if (currentSpeed < 15) {
    // 慢速騎行也能恢復
    recoveryRate *= 0.5;
  } else if (currentSpeed > 30) {
    // 高速時無法恢復
    recoveryRate = 0;
  } else {
    // 正常騎行速度，少量恢復
    recoveryRate *= 0.3;
  }

  // 補給影響
  if (hasSupplies) {
    recoveryRate *= 1.5;
  }

  // 團隊支援
  const teamSupportBonus = teamSupport / 100 * 0.3;
  recoveryRate *= (1 + teamSupportBonus);

  // 士氣影響
  const moraleMultiplier = 0.5 + (morale / 100);
  recoveryRate *= moraleMultiplier;

  // 天氣影響恢復
  const weatherEffects = {
    clear: 1.0,
    hot: 0.7,
    hot_sunny: 0.65,
    cold: 0.9,
    rain: 0.8
  };
  recoveryRate *= (weatherEffects[weather] || 1.0);

  // 每分鐘最多恢復5%，最少0.1%
  return Math.max(0.1, Math.min(5, recoveryRate));
}

/**
 * 計算士氣變化
 * @param {Object} params - 士氣計算參數
 * @returns {number} 士氣變化值
 */
export function calculateMoraleChange(params) {
  const {
    currentMorale = 70,
    event = null,
    performance = 'onTarget',
    teamHarmony = 70,
    weather = 'clear',
    fatigue = 0
  } = params;

  let moraleChange = 0;

  // 事件影響
  const eventEffects = {
    overtake: 10,
    goodWeather: 5,
    successfulClimb: 15,
    teamworkSuccess: 12,
    mysteryBonus: 20,
    mechanicalFailure: -15,
    badWeather: -10,
    dropped: -20,
    conflict: -25,
    exhaustion: -30
  };

  if (event && eventEffects[event] !== undefined) {
    moraleChange += eventEffects[event];
  }

  // 表現影響
  const performanceEffects = {
    leading: 5,
    onTarget: 2,
    behind: -5,
    farBehind: -10
  };
  moraleChange += performanceEffects[performance] || 0;

  // 團隊和諧度影響
  const harmonyMultiplier = 0.5 + (teamHarmony / 100);
  moraleChange *= harmonyMultiplier;

  // 疲勞度影響
  if (fatigue > 70) {
    if (moraleChange > 0) {
      moraleChange *= 0.5;
    } else {
      moraleChange *= 1.5;
    }
  }

  // 天氣對士氣的持續影響
  const weatherMood = {
    sunny: 0.5,
    clear: 0.5,
    cloudy: 0,
    rain: -1,
    storm: -2
  };
  moraleChange += (weatherMood[weather] || 0);

  // 士氣慣性
  if (currentMorale > 80 && moraleChange > 0) {
    moraleChange *= 0.5;
  } else if (currentMorale < 20 && moraleChange < 0) {
    moraleChange *= 0.5;
  }

  return moraleChange;
}

/**
 * 計算士氣效果
 * @param {number} morale - 士氣值 (0-100)
 * @returns {Object} 士氣影響的各項修正值
 */
export function calculateMoraleEffects(morale) {
  const effects = {
    speedModifier: 0,
    staminaModifier: 0,
    recoveryModifier: 0,
    teamworkModifier: 0
  };

  if (morale >= 80) {
    effects.speedModifier = 0.10;
    effects.staminaModifier = -0.10;
    effects.recoveryModifier = 0.20;
    effects.teamworkModifier = 0.15;
  } else if (morale >= 60) {
    effects.speedModifier = 0.05;
    effects.staminaModifier = 0;
    effects.recoveryModifier = 0.10;
    effects.teamworkModifier = 0.05;
  } else if (morale >= 40) {
    effects.speedModifier = -0.05;
    effects.staminaModifier = 0.10;
    effects.recoveryModifier = -0.10;
    effects.teamworkModifier = -0.10;
  } else if (morale >= 20) {
    effects.speedModifier = -0.15;
    effects.staminaModifier = 0.20;
    effects.recoveryModifier = -0.30;
    effects.teamworkModifier = -0.25;
  } else {
    effects.speedModifier = -0.30;
    effects.staminaModifier = 0.40;
    effects.recoveryModifier = -0.50;
    effects.teamworkModifier = -0.50;
  }

  return effects;
}

/**
 * 計算路段時間
 * @param {Object} params - 路段計算參數
 * @returns {number} 路段時間（分鐘）
 */
export function calculateSegmentTime(params) {
  const {
    distance = 10,
    baseSpeed = 30,
    terrain = 'flat',
    weather = 'clear',
    formation = 'solo',
    stamina = 100,
    events = []
  } = params;

  // 計算有效速度
  const effectiveSpeed = calculateEffectiveSpeed({
    characterSpeed: baseSpeed,
    terrainFactor: terrain,
    staminaLevel: stamina,
    formationType: formation,
    weatherCondition: weather
  });

  // 基礎時間（小時）
  let segmentTime = distance / effectiveSpeed;

  // 事件造成的額外時間
  let eventDelays = 0;
  if (Array.isArray(events)) {
    events.forEach(event => {
      eventDelays += event.timeImpact || 0;
    });
  }

  // 轉換為分鐘
  segmentTime = segmentTime * 60 + eventDelays;

  return segmentTime;
}

/**
 * 計算總時間
 * @param {Array} segments - 路段列表
 * @param {Array} bonuses - 獎勵列表
 * @param {Array} penalties - 懲罰列表
 * @returns {Object} 時間計算結果
 */
export function calculateTotalTime(segments, bonuses = [], penalties = []) {
  let totalTime = 0;

  // 計算所有路段時間
  if (Array.isArray(segments)) {
    segments.forEach(segment => {
      totalTime += calculateSegmentTime(segment);
    });
  }

  // 應用獎勵時間
  const totalBonus = bonuses.reduce((sum, bonus) => sum + (bonus.value || 0), 0);

  // 應用懲罰時間
  const totalPenalty = penalties.reduce((sum, penalty) => sum + (penalty.value || 0), 0);

  // 最終時間
  const finalTime = Math.max(0, totalTime - totalBonus + totalPenalty);

  return {
    rawTime: totalTime,
    bonusTime: totalBonus,
    penaltyTime: totalPenalty,
    finalTime: finalTime,
    formatted: formatTime(finalTime)
  };
}

/**
 * 格式化時間
 * @param {number} minutes - 分鐘數
 * @returns {string} 格式化的時間字串
 */
export function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const secs = Math.floor((minutes % 1) * 60);
  return `${hours}小時${mins}分${secs}秒`;
}

/**
 * 計算最終得分
 * @param {Object} params - 得分計算參數
 * @returns {number} 最終得分
 */
export function calculateFinalScore(params) {
  const {
    completionTime = 720,
    targetTime = 720,
    teamIntegrity = 100,
    suppliesUsed = 10,
    eventsHandled = 0,
    specialAchievements = [],
    difficulty = 'normal'
  } = params;

  let score = 10000;

  // 時間分數
  const timeBonus = Math.max(0, (targetTime - completionTime) * 10);
  score += timeBonus;

  // 團隊完整度獎勵
  const teamBonus = teamIntegrity * 20;
  score += teamBonus;

  // 資源效率
  const efficiencyBonus = Math.max(0, (20 - suppliesUsed) * 50);
  score += efficiencyBonus;

  // 事件處理獎勵
  const eventBonus = eventsHandled * 500;
  score += eventBonus;

  // 特殊成就加分
  const achievementPoints = {
    noDropout: 1000,
    perfectFormation: 800,
    mountainKing: 600,
    speedDemon: 700,
    ironWill: 900,
    weatherMaster: 500,
    mechanicalGenius: 400,
    teamHarmony: 600
  };

  specialAchievements.forEach(achievement => {
    score += achievementPoints[achievement] || 0;
  });

  // 難度倍數
  const difficultyMultiplier = {
    easy: 0.8,
    normal: 1.0,
    hard: 1.3,
    extreme: 1.6
  };

  score *= (difficultyMultiplier[difficulty] || 1.0);

  return Math.floor(score);
}

/**
 * 計算排名
 * @param {number} score - 分數
 * @param {Array} allScores - 所有分數列表
 * @returns {Object} 排名資訊
 */
export function calculateRanking(score, allScores) {
  const betterThan = allScores.filter(s => s < score).length;
  const percentile = (betterThan / allScores.length) * 100;

  let grade;
  if (percentile >= 95) grade = 'S';
  else if (percentile >= 85) grade = 'A';
  else if (percentile >= 70) grade = 'B';
  else if (percentile >= 50) grade = 'C';
  else if (percentile >= 30) grade = 'D';
  else grade = 'E';

  return {
    score,
    percentile: Math.floor(percentile),
    grade,
    rank: allScores.length - betterThan
  };
}
