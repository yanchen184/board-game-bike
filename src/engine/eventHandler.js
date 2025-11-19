/**
 * 事件處理邏輯
 * 負責事件觸發、決策處理和效果應用
 */

import eventsData from '../data/events.json';

/**
 * 檢查事件觸發條件
 * @param {Object} currentState - 當前遊戲狀態
 * @param {Object} route - 路線數據
 * @returns {Array} 觸發的事件列表
 */
export function checkEventTriggers(currentState, route) {
  const triggeredEvents = [];

  if (!eventsData || !eventsData.events) {
    return triggeredEvents;
  }

  eventsData.events.forEach(event => {
    if (shouldTriggerEvent(event, currentState, route)) {
      triggeredEvents.push(event);
    }
  });

  return triggeredEvents;
}

/**
 * 判斷事件是否應該觸發
 * @param {Object} event - 事件數據
 * @param {Object} currentState - 當前狀態
 * @param {Object} route - 路線數據
 * @returns {boolean} 是否觸發
 */
function shouldTriggerEvent(event, currentState, route) {
  const { triggerConditions } = event;

  if (!triggerConditions) return false;

  // 檢查固定位置事件（如補給站）
  if (triggerConditions.fixedLocations) {
    const isAtFixedLocation = triggerConditions.fixedLocations.some(location => {
      return Math.abs(currentState.currentDistance - location) < 0.5;
    });
    if (triggerConditions.mandatory && isAtFixedLocation) {
      return !currentState.triggeredEvents?.includes(event.id);
    }
  }

  // 檢查距離範圍觸發
  if (triggerConditions.distanceRanges) {
    const inRange = triggerConditions.distanceRanges.some(range => {
      return currentState.currentDistance >= range.start &&
             currentState.currentDistance <= range.end;
    });
    if (!inRange) return false;
  }

  // 檢查地形條件
  if (triggerConditions.terrainType) {
    const currentSegment = getCurrentSegment(currentState, route);
    if (currentSegment?.terrainType !== triggerConditions.terrainType) {
      return false;
    }
  }

  // 檢查士氣條件
  if (triggerConditions.moraleThreshold !== undefined) {
    if (currentState.teamMorale >= triggerConditions.moraleThreshold) {
      return false;
    }
  }

  // 檢查機率
  const probability = triggerConditions.probability || triggerConditions.baseProbability || 0.1;
  const adjustedProbability = calculateAdjustedProbability(probability, currentState);

  if (Math.random() > adjustedProbability) {
    return false;
  }

  // 檢查是否已經觸發過
  if (currentState.triggeredEvents?.includes(event.id)) {
    return false;
  }

  return true;
}

/**
 * 獲取當前路段
 * @param {Object} currentState - 當前狀態
 * @param {Object} route - 路線數據
 * @returns {Object} 當前路段
 */
function getCurrentSegment(currentState, route) {
  if (!route.segments) return null;

  let accumulatedDistance = 0;
  for (const segment of route.segments) {
    accumulatedDistance += segment.distance;
    if (currentState.currentDistance < accumulatedDistance) {
      return segment;
    }
  }

  return route.segments[route.segments.length - 1];
}

/**
 * 計算調整後的觸發機率
 * @param {number} baseProbability - 基礎機率
 * @param {Object} currentState - 當前狀態
 * @returns {number} 調整後的機率
 */
function calculateAdjustedProbability(baseProbability, currentState) {
  let probability = baseProbability;

  // 根據難度調整
  const difficultyMultipliers = {
    easy: 0.5,
    normal: 1.0,
    hard: 1.5,
    extreme: 2.0
  };
  probability *= difficultyMultipliers[currentState.difficulty] || 1.0;

  // 根據天氣調整
  const weatherMultipliers = {
    clear: 0.8,
    rainy: 1.5,
    stormy: 2.0
  };
  probability *= weatherMultipliers[currentState.weather] || 1.0;

  // 保底機制
  if (currentState.distanceSinceLastEvent > 50) {
    probability *= 2;
  }

  return Math.min(1.0, probability);
}

/**
 * 解析事件並返回結果
 * @param {Object} event - 事件數據
 * @param {Object} playerChoices - 玩家選擇
 * @param {Object} teamConfig - 團隊配置
 * @returns {Object} 事件結果
 */
export function resolveEvent(event, playerChoices, teamConfig) {
  if (!event || !event.decisionTree) {
    return {
      eventId: event?.id,
      outcome: {},
      modifiers: {},
      description: '事件無法解析'
    };
  }

  const { decisionTree } = event;
  let currentLayer = 'layer1';
  let selectedOption = null;
  let outcome = {};
  let modifiers = {};

  // 處理第一層決策
  if (playerChoices.layer1 && decisionTree[currentLayer]) {
    const layer1Options = decisionTree[currentLayer];
    selectedOption = layer1Options.find(opt => opt.id === playerChoices.layer1);

    if (selectedOption) {
      outcome = { ...selectedOption.effects };

      // 檢查是否有下一層
      if (selectedOption.nextLayer) {
        currentLayer = selectedOption.nextLayer;

        // 處理第二層決策
        if (playerChoices.layer2 && decisionTree[currentLayer]) {
          const layer2Options = Array.isArray(decisionTree[currentLayer])
            ? decisionTree[currentLayer]
            : [decisionTree[currentLayer]];

          const layer2Option = layer2Options.find(opt => opt.id === playerChoices.layer2);

          if (layer2Option && layer2Option.effects) {
            outcome = { ...outcome, ...layer2Option.effects };
          }
        }
      }
    }
  }

  // 應用角色特殊效果
  if (event.characterModifiers && teamConfig) {
    modifiers = applyCharacterModifiers(event.characterModifiers, teamConfig);
  }

  // 應用裝備特殊效果
  if (event.equipmentModifiers && teamConfig.equipment) {
    const equipModifiers = applyEquipmentModifiers(event.equipmentModifiers, teamConfig.equipment);
    modifiers = { ...modifiers, ...equipModifiers };
  }

  return {
    eventId: event.id,
    eventName: event.name,
    outcome,
    modifiers,
    description: generateEventDescription(event, selectedOption, outcome)
  };
}

/**
 * 應用角色修正
 * @param {Object} characterModifiers - 角色修正配置
 * @param {Object} teamConfig - 團隊配置
 * @returns {Object} 修正值
 */
function applyCharacterModifiers(characterModifiers, teamConfig) {
  const modifiers = {};

  if (!teamConfig.members) return modifiers;

  teamConfig.members.forEach(member => {
    const memberType = member.type || member.characterType;
    if (characterModifiers[memberType]) {
      Object.assign(modifiers, characterModifiers[memberType]);
    }
  });

  return modifiers;
}

/**
 * 應用裝備修正
 * @param {Object} equipmentModifiers - 裝備修正配置
 * @param {Object} equipment - 裝備配置
 * @returns {Object} 修正值
 */
function applyEquipmentModifiers(equipmentModifiers, equipment) {
  const modifiers = {};

  Object.keys(equipment).forEach(equipType => {
    const equipItem = equipment[equipType];
    const equipKey = equipItem.id || equipItem.type;

    if (equipmentModifiers[equipKey]) {
      Object.assign(modifiers, equipmentModifiers[equipKey]);
    }
  });

  return modifiers;
}

/**
 * 生成事件描述
 * @param {Object} event - 事件
 * @param {Object} selectedOption - 選擇的選項
 * @param {Object} outcome - 結果
 * @returns {string} 事件描述
 */
function generateEventDescription(event, selectedOption, outcome) {
  let description = event.description || '';

  if (selectedOption) {
    description += `\n選擇：${selectedOption.option}`;
    description += `\n${selectedOption.description}`;
  }

  if (outcome.timeDelay) {
    description += `\n時間影響：+${outcome.timeDelay}分鐘`;
  }

  if (outcome.speedModifier) {
    const speedChange = outcome.speedModifier > 0 ? '+' : '';
    description += `\n速度影響：${speedChange}${(outcome.speedModifier * 100).toFixed(0)}%`;
  }

  if (outcome.moraleBoost || outcome.moraleChange) {
    const moraleChange = outcome.moraleBoost || outcome.moraleChange;
    const moraleSign = moraleChange > 0 ? '+' : '';
    description += `\n士氣影響：${moraleSign}${moraleChange}`;
  }

  return description;
}

/**
 * 應用事件效果到遊戲狀態
 * @param {Object} gameState - 遊戲狀態
 * @param {Object} eventResult - 事件結果
 * @returns {Object} 更新後的遊戲狀態
 */
export function applyEventEffects(gameState, eventResult) {
  const newState = { ...gameState };
  const { outcome, modifiers } = eventResult;

  // 應用時間影響
  if (outcome.timeDelay) {
    newState.timeElapsed = (newState.timeElapsed || 0) + outcome.timeDelay;
  }

  // 應用速度修正
  if (outcome.speedModifier !== undefined) {
    newState.speedModifier = (newState.speedModifier || 0) + outcome.speedModifier;
  }

  // 應用士氣影響
  if (outcome.moraleBoost !== undefined) {
    newState.teamMorale = Math.max(0, Math.min(100, newState.teamMorale + outcome.moraleBoost));
  }

  if (outcome.moraleChange !== undefined) {
    newState.teamMorale = Math.max(0, Math.min(100, newState.teamMorale + outcome.moraleChange));
  }

  // 應用體力影響
  if (outcome.staminaRecovery !== undefined) {
    Object.keys(newState.teamStamina || {}).forEach(memberId => {
      newState.teamStamina[memberId] = Math.min(
        100,
        newState.teamStamina[memberId] + (outcome.staminaRecovery * 100)
      );
    });
  }

  if (outcome.staminaDrain !== undefined) {
    Object.keys(newState.teamStamina || {}).forEach(memberId => {
      newState.teamStamina[memberId] = Math.max(
        0,
        newState.teamStamina[memberId] - (outcome.staminaDrain * 100)
      );
    });
  }

  // 應用隊形變化
  if (outcome.formationBreak) {
    newState.formation = 'solo';
  }

  if (outcome.teamDisband) {
    newState.teamIntegrity = 0;
  }

  // 應用修正值
  if (modifiers.timeReduction) {
    newState.timeElapsed = Math.max(0, newState.timeElapsed - modifiers.timeReduction * 60);
  }

  if (modifiers.staminaReduction) {
    Object.keys(newState.teamStamina || {}).forEach(memberId => {
      const saved = newState.teamStamina[memberId] * modifiers.staminaReduction;
      newState.teamStamina[memberId] = Math.min(100, newState.teamStamina[memberId] + saved);
    });
  }

  // 記錄事件
  if (!newState.eventHistory) {
    newState.eventHistory = [];
  }
  newState.eventHistory.push({
    eventId: eventResult.eventId,
    eventName: eventResult.eventName,
    timestamp: newState.timeElapsed,
    distance: newState.currentDistance,
    outcome: outcome
  });

  // 標記事件已觸發
  if (!newState.triggeredEvents) {
    newState.triggeredEvents = [];
  }
  if (!newState.triggeredEvents.includes(eventResult.eventId)) {
    newState.triggeredEvents.push(eventResult.eventId);
  }

  // 更新距離計數器
  newState.distanceSinceLastEvent = 0;

  return newState;
}

/**
 * 獲取事件選項建議
 * @param {Object} event - 事件
 * @param {Object} teamConfig - 團隊配置
 * @param {Object} currentState - 當前狀態
 * @returns {Array} 建議列表
 */
export function getEventRecommendations(event, teamConfig, currentState) {
  const recommendations = [];

  if (!event || !event.decisionTree || !event.decisionTree.layer1) {
    return recommendations;
  }

  const options = event.decisionTree.layer1;

  options.forEach(option => {
    let score = 50; // 基礎分數
    let reasoning = [];

    // 根據當前體力評估
    const averageStamina = Object.values(currentState.teamStamina || {}).reduce(
      (sum, s) => sum + s,
      0
    ) / Object.keys(currentState.teamStamina || {}).length;

    if (averageStamina < 30 && option.effects?.staminaMultiplier > 1) {
      score -= 20;
      reasoning.push('體力不足，不建議高消耗選項');
    }

    // 根據時間壓力評估
    const progress = (currentState.currentDistance / currentState.totalDistance) * 100;
    if (progress > 80 && option.effects?.timeDelay > 10) {
      score -= 15;
      reasoning.push('接近終點，不建議花費過多時間');
    }

    // 根據士氣評估
    if (currentState.teamMorale < 40 && option.effects?.moraleBoost) {
      score += 15;
      reasoning.push('士氣低落，建議選擇能提升士氣的選項');
    }

    // 根據團隊配置評估
    if (teamConfig.members) {
      const hasClimber = teamConfig.members.some(m => m.type === 'climber');
      if (hasClimber && option.id.includes('climb')) {
        score += 10;
        reasoning.push('隊伍有爬坡手，爬坡選項更有利');
      }
    }

    recommendations.push({
      optionId: option.id,
      optionName: option.option,
      score: Math.max(0, Math.min(100, score)),
      reasoning: reasoning,
      riskLevel: calculateRiskLevel(option.effects),
      expectedOutcome: summarizeOutcome(option.effects)
    });
  });

  // 按分數排序
  recommendations.sort((a, b) => b.score - a.score);

  return recommendations;
}

/**
 * 計算風險等級
 * @param {Object} effects - 效果
 * @returns {string} 風險等級
 */
function calculateRiskLevel(effects) {
  if (!effects) return 'low';

  let riskScore = 0;

  if (effects.crashRisk) riskScore += effects.crashRisk * 50;
  if (effects.failureProbability) riskScore += effects.failureProbability * 40;
  if (effects.rimDamageProbability) riskScore += effects.rimDamageProbability * 45;
  if (effects.staminaMultiplier > 2) riskScore += 20;
  if (effects.timeDelay > 15) riskScore += 15;

  if (riskScore > 50) return 'high';
  if (riskScore > 25) return 'medium';
  return 'low';
}

/**
 * 總結結果
 * @param {Object} effects - 效果
 * @returns {string} 結果總結
 */
function summarizeOutcome(effects) {
  const outcomes = [];

  if (effects.speedModifier) {
    outcomes.push(`速度${effects.speedModifier > 0 ? '增加' : '減少'}${Math.abs(effects.speedModifier * 100).toFixed(0)}%`);
  }

  if (effects.timeDelay) {
    outcomes.push(`耗時${effects.timeDelay}分鐘`);
  }

  if (effects.staminaRecovery) {
    outcomes.push(`恢復${(effects.staminaRecovery * 100).toFixed(0)}%體力`);
  }

  if (effects.moraleBoost) {
    outcomes.push(`士氣${effects.moraleBoost > 0 ? '+' : ''}${effects.moraleBoost}`);
  }

  return outcomes.join('，') || '無明顯影響';
}

export default {
  checkEventTriggers,
  resolveEvent,
  applyEventEffects,
  getEventRecommendations
};
