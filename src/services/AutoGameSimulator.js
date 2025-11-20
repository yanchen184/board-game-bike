import { initializeRaceState, updateRaceState, getRaceSummary } from './gameEngine';
import { getSegmentAtDistance, getNextSupplyStation } from '../data/routes';
import { getRandomEvent } from '../data/events';

/**
 * AutoGameSimulator - 自動遊戲模擬器
 * 根據預設策略自動執行整場比賽，並生成動畫快照
 */

/**
 * 根據預設策略自動處理事件
 * @param {Object} state - 當前狀態
 * @param {Object} event - 事件對象
 * @param {Object} strategy - 策略配置
 * @returns {Object} 更新後的狀態
 */
function autoHandleEvent(state, event, strategy) {
  const newState = { ...state };

  // 根據事件類型和策略自動選擇
  if (event.type === 'supply_station') {
    // 補給站策略
    const effects = getSupplyStationEffects(strategy.supplyStrategy);
    return applyEffects(newState, effects);
  }

  if (event.type === 'mechanical_failure') {
    // 機械故障策略
    const effects = getMechanicalFailureEffects(strategy.mechanicalStrategy);
    return applyEffects(newState, effects);
  }

  // 其他事件使用默認處理
  return newState;
}

/**
 * 獲取補給站策略效果
 * @param {string} strategy - 補給策略 (skip/quick/full)
 * @returns {Object} 效果對象
 */
function getSupplyStationEffects(strategy) {
  switch (strategy) {
    case 'skip':
      return {
        timeDelay: 0,
        staminaRestore: 0,
        moraleChange: -5,
      };
    case 'quick':
      return {
        timeDelay: 5 * 60, // 5分鐘
        staminaRestore: 15,
        moraleChange: 5,
      };
    case 'full':
      return {
        timeDelay: 20 * 60, // 20分鐘
        staminaRestore: 50,
        moraleChange: 15,
      };
    default:
      return {
        timeDelay: 5 * 60,
        staminaRestore: 15,
        moraleChange: 5,
      };
  }
}

/**
 * 獲取機械故障策略效果
 * @param {string} strategy - 機械故障策略 (quick_fix/thorough_repair/continue)
 * @returns {Object} 效果對象
 */
function getMechanicalFailureEffects(strategy) {
  switch (strategy) {
    case 'quick_fix':
      return {
        timeDelay: 5 * 60, // 5分鐘
        speedModifier: 1.0,
        moraleChange: -5,
      };
    case 'thorough_repair':
      return {
        timeDelay: 15 * 60, // 15分鐘
        speedModifier: 1.0,
        moraleChange: 0,
      };
    case 'continue':
      return {
        timeDelay: 0,
        speedModifier: 0.8, // 速度-20%
        moraleChange: -10,
      };
    default:
      return {
        timeDelay: 5 * 60,
        speedModifier: 1.0,
        moraleChange: -5,
      };
  }
}

/**
 * 應用效果到狀態
 * @param {Object} state - 當前狀態
 * @param {Object} effects - 效果對象
 * @returns {Object} 更新後的狀態
 */
function applyEffects(state, effects) {
  const newState = { ...state };

  // 時間延遲
  if (effects.timeDelay) {
    newState.timeElapsed += effects.timeDelay;
  }

  // 體力恢復
  if (effects.staminaRestore) {
    newState.team.members = newState.team.members.map(member => ({
      ...member,
      currentStamina: Math.min(100, member.currentStamina + effects.staminaRestore),
    }));
  }

  // 士氣變化
  if (effects.moraleChange) {
    newState.team.morale = Math.max(0, Math.min(100, newState.team.morale + effects.moraleChange));
  }

  // 速度修正（作為臨時效果）
  if (effects.speedModifier && effects.speedModifier !== 1.0) {
    newState.activeEffects = newState.activeEffects || [];
    newState.activeEffects.push({
      speedModifier: effects.speedModifier,
      endTime: newState.timeElapsed + 600, // 持續10分鐘
      source: 'auto_event',
    });
  }

  return newState;
}

/**
 * 根據策略自動調整隊形
 * @param {Object} state - 當前狀態
 * @param {Object} strategy - 策略配置
 * @returns {Object} 更新後的狀態
 */
function autoAdjustFormation(state, strategy) {
  const currentSegment = getSegmentAtDistance(state.distance);

  // 檢查是否在爬坡
  if (currentSegment && currentSegment.terrain === 'uphill') {
    // 根據爬坡策略調整隊形
    let targetFormation = state.team.formation;

    switch (strategy.climbingStrategy) {
      case 'single':
        targetFormation = 'single';
        break;
      case 'double':
        targetFormation = 'double';
        break;
      case 'maintain':
        // 保持原隊形
        break;
    }

    if (targetFormation !== state.team.formation) {
      return {
        ...state,
        team: {
          ...state.team,
          formation: targetFormation,
        },
        timeElapsed: state.timeElapsed + 30, // 切換隊形需要30秒
      };
    }
  }

  return state;
}

/**
 * 根據策略自動輪替領騎
 * @param {Object} state - 當前狀態
 * @param {Object} strategy - 策略配置
 * @returns {Object} 更新後的狀態
 */
function autoRotateLeader(state, strategy) {
  const currentLeader = state.team.currentLeader || 0;
  const leaderStamina = state.team.members[currentLeader]?.currentStamina || 100;

  // 檢查是否需要輪替
  if (leaderStamina < strategy.rotationThreshold) {
    // 找到體力最高的隊員
    let maxStamina = -1;
    let newLeader = currentLeader;

    state.team.members.forEach((member, idx) => {
      if (member.currentStamina > maxStamina) {
        maxStamina = member.currentStamina;
        newLeader = idx;
      }
    });

    if (newLeader !== currentLeader) {
      return {
        ...state,
        team: {
          ...state.team,
          currentLeader: newLeader,
        },
      };
    }
  }

  return state;
}

/**
 * 應用節奏策略到速度
 * @param {number} baseSpeed - 基礎速度
 * @param {string} paceStrategy - 節奏策略 (conservative/balanced/aggressive)
 * @returns {number} 調整後的速度
 */
function applyPaceStrategy(baseSpeed, paceStrategy) {
  switch (paceStrategy) {
    case 'conservative':
      return baseSpeed * 0.8; // 速度80%
    case 'aggressive':
      return baseSpeed * 1.2; // 速度120%
    case 'balanced':
    default:
      return baseSpeed; // 標準速度
  }
}

/**
 * 應用節奏策略到體力消耗
 * @param {number} baseDrain - 基礎體力消耗
 * @param {string} paceStrategy - 節奏策略
 * @returns {number} 調整後的體力消耗
 */
function applyPaceStaminaDrain(baseDrain, paceStrategy) {
  switch (paceStrategy) {
    case 'conservative':
      return baseDrain * 0.8; // 體力消耗-20%
    case 'aggressive':
      return baseDrain * 1.3; // 體力消耗+30%
    case 'balanced':
    default:
      return baseDrain; // 標準消耗
  }
}

/**
 * 運行自動模擬
 * @param {Object} config - 配置對象
 * @param {Object} config.team - 團隊配置
 * @param {Object} config.bike - 裝備配置
 * @param {string} config.formation - 初始隊形
 * @param {Object} config.strategy - 策略配置
 * @param {number} config.targetDuration - 目標模擬時間（秒）默認30秒
 * @param {number} config.fps - 動畫幀率，默認30
 * @returns {Object} 模擬結果
 */
export function runAutoSimulation(config) {
  const {
    team,
    bike,
    formation,
    strategy,
    targetDuration = 30, // 30秒動畫
    fps = 30, // 30 FPS
  } = config;

  // 初始化遊戲狀態
  const teamConfig = {
    ...team,
    formation,
    currentLeader: 0,
    morale: 100,
  };

  let state = initializeRaceState(teamConfig, bike);

  // 計算模擬參數
  const totalFrames = targetDuration * fps;
  const snapshots = []; // 存儲每幀快照
  let frameCount = 0;

  // 計算每幀應該推進多少真實時間
  // 假設平均完成時間約12小時 = 43200秒
  const estimatedRealTime = 12 * 60 * 60;
  const timeScaleFactor = estimatedRealTime / targetDuration;
  const deltaTimePerFrame = timeScaleFactor / fps;

  // 事件追蹤
  const processedSupplyStations = new Set();
  const randomEventCheckInterval = 100; // 每100幀檢查一次隨機事件
  let lastEventCheck = 0;

  // 主模擬循環
  while (!state.isComplete && frameCount < totalFrames * 2) {
    // 防止無限循環
    frameCount++;

    // 1. 自動輪替領騎（根據策略閾值）
    state = autoRotateLeader(state, strategy);

    // 2. 自動調整隊形（根據地形和策略）
    state = autoAdjustFormation(state, strategy);

    // 3. 檢查補給站
    const nextStation = getNextSupplyStation(state.distance - 1);
    if (nextStation && state.distance >= nextStation.km) {
      const stationKey = `station_${nextStation.km}`;
      if (!processedSupplyStations.has(stationKey)) {
        processedSupplyStations.add(stationKey);

        // 自動處理補給站
        const effects = getSupplyStationEffects(strategy.supplyStrategy);
        state = applyEffects(state, effects);
        state.stats.supplyStops += 1;

        // 記錄事件
        state.events.push({
          type: 'supply_station',
          id: stationKey,
          timestamp: state.timeElapsed,
          location: nextStation,
          choice: strategy.supplyStrategy,
        });
      }
    }

    // 4. 隨機事件檢查（降低頻率）
    if (frameCount - lastEventCheck > randomEventCheckInterval) {
      lastEventCheck = frameCount;

      const shouldTriggerEvent = Math.random() < 0.15; // 15%機率
      if (shouldTriggerEvent) {
        const randomEvent = getRandomEvent({
          distance: state.distance,
          weather: state.weather.type,
          bikeCondition: state.bike.durability || 100,
        });

        if (randomEvent) {
          // 自動處理事件
          if (randomEvent.type === 'mechanical_failure') {
            const effects = getMechanicalFailureEffects(strategy.mechanicalStrategy);
            state = applyEffects(state, effects);
            state.stats.mechanicalFailures += 1;

            // 記錄事件
            state.events.push({
              ...randomEvent,
              timestamp: state.timeElapsed,
              choice: strategy.mechanicalStrategy,
            });
          } else {
            // 其他事件直接應用效果
            if (randomEvent.effects) {
              state = applyEffects(state, randomEvent.effects);
            }

            state.events.push({
              ...randomEvent,
              timestamp: state.timeElapsed,
            });
          }
        }
      }
    }

    // 5. 更新遊戲狀態（使用調整過的deltaTime）
    state = updateRaceState(state, deltaTimePerFrame);

    // 6. 應用節奏策略修正（需要調整引擎輸出）
    // 注意：這裡我們已經在計算中考慮了策略，但為了記錄，我們保存策略信息
    state.appliedStrategy = strategy.paceStrategy;

    // 7. 每N幀保存快照（用於動畫）
    if (frameCount % Math.ceil(totalFrames / 100) === 0 || state.isComplete) {
      // 保存100個關鍵快照
      snapshots.push({
        frame: frameCount,
        distance: state.distance,
        timeElapsed: state.timeElapsed,
        speed: state.speed,
        leader: state.team.currentLeader,
        formation: state.team.formation,
        morale: state.team.morale,
        members: state.team.members.map(m => ({
          id: m.id,
          name: m.name,
          stamina: m.currentStamina,
        })),
        terrain: getSegmentAtDistance(state.distance)?.terrain,
        weather: state.weather.type,
      });
    }

    // 檢查完成條件
    if (state.isComplete) {
      break;
    }
  }

  // 生成最終結果
  const summary = getRaceSummary(state);

  return {
    success: true,
    completed: summary.completed,
    failed: summary.failed,
    finalState: state,
    summary,
    snapshots, // 動畫快照
    totalFrames: frameCount,
    targetDuration,
    fps,
    strategy, // 記錄使用的策略
  };
}

/**
 * 從快照插值計算中間幀
 * @param {Array} snapshots - 快照數組
 * @param {number} targetFrame - 目標幀
 * @returns {Object} 插值後的狀態
 */
export function interpolateSnapshot(snapshots, targetFrame) {
  if (snapshots.length === 0) return null;

  // 找到最接近的兩個快照
  let prev = snapshots[0];
  let next = snapshots[snapshots.length - 1];

  for (let i = 0; i < snapshots.length - 1; i++) {
    if (snapshots[i].frame <= targetFrame && snapshots[i + 1].frame >= targetFrame) {
      prev = snapshots[i];
      next = snapshots[i + 1];
      break;
    }
  }

  // 如果目標幀在範圍外，返回邊界快照
  if (targetFrame <= prev.frame) return prev;
  if (targetFrame >= next.frame) return next;

  // 線性插值
  const t = (targetFrame - prev.frame) / (next.frame - prev.frame);

  return {
    frame: targetFrame,
    distance: prev.distance + (next.distance - prev.distance) * t,
    timeElapsed: prev.timeElapsed + (next.timeElapsed - prev.timeElapsed) * t,
    speed: prev.speed + (next.speed - prev.speed) * t,
    leader: next.leader, // 離散值，使用最近的
    formation: next.formation, // 離散值
    morale: prev.morale + (next.morale - prev.morale) * t,
    members: prev.members.map((m, idx) => ({
      ...m,
      stamina: m.stamina + (next.members[idx].stamina - m.stamina) * t,
    })),
    terrain: next.terrain,
    weather: next.weather,
  };
}
