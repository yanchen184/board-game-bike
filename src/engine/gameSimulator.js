/**
 * 遊戲模擬器
 * 用於30秒快速演示和完整遊戲模擬
 */

import {
  calculateEffectiveSpeed,
  calculateStaminaConsumption,
  calculateRecoveryRate,
  calculateMoraleChange,
  calculateMoraleEffects,
  calculateSegmentTime,
  calculateTotalTime,
  calculateFinalScore
} from './calculationEngine.js';

/**
 * 遊戲模擬器類
 */
export class GameSimulator {
  /**
   * 建構函數
   * @param {Object} teamConfig - 團隊配置
   * @param {Object} equipmentConfig - 裝備配置
   * @param {Object} strategyConfig - 策略配置
   * @param {Object} route - 路線數據
   */
  constructor(teamConfig, equipmentConfig, strategyConfig, route) {
    this.teamConfig = teamConfig || this.getDefaultTeam();
    this.equipmentConfig = equipmentConfig || this.getDefaultEquipment();
    this.strategyConfig = strategyConfig || this.getDefaultStrategy();
    this.route = route || this.getDefaultRoute();
    this.currentState = this.initializeState();
    this.eventHistory = [];
  }

  /**
   * 獲取默認團隊配置
   */
  getDefaultTeam() {
    return {
      members: [
        {
          id: 'member1',
          type: 'climber',
          speed: 85,
          stamina: 80,
          endurance: 85,
          recovery: 75
        },
        {
          id: 'member2',
          type: 'sprinter',
          speed: 90,
          stamina: 70,
          endurance: 65,
          recovery: 70
        },
        {
          id: 'member3',
          type: 'endurance',
          speed: 80,
          stamina: 90,
          endurance: 90,
          recovery: 85
        }
      ]
    };
  }

  /**
   * 獲取默認裝備配置
   */
  getDefaultEquipment() {
    return {
      frame: { bonus: 0.1, weight: 7 },
      wheelset: { bonus: 0.05, aero: 80 },
      drivetrain: { bonus: 0.08, efficiency: 85 }
    };
  }

  /**
   * 獲取默認策略配置
   */
  getDefaultStrategy() {
    return {
      initialFormation: 'single_line',
      paceStrategy: 'balanced',
      supplyStrategy: 'standard'
    };
  }

  /**
   * 獲取默認路線
   */
  getDefaultRoute() {
    return {
      totalDistance: 380,
      segments: Array(12).fill(null).map((_, i) => ({
        id: `seg_${i + 1}`,
        distance: 30,
        terrain: 'flat'
      }))
    };
  }

  /**
   * 初始化遊戲狀態
   */
  initializeState() {
    const teamStamina = {};
    this.teamConfig.members.forEach(member => {
      teamStamina[member.id] = 100;
    });

    return {
      currentDistance: 0,
      currentSegment: 0,
      timeElapsed: 0,
      teamStamina: teamStamina,
      teamMorale: 100,
      events: [],
      formation: this.strategyConfig.initialFormation,
      completedSegments: [],
      isFinished: false
    };
  }

  /**
   * 模擬遊戲進程（快速演示）
   * @param {number} duration - 演示時長（毫秒）
   * @returns {Array} 每個時間點的狀態快照
   */
  simulate(duration = 30000) {
    const snapshots = [];
    const framesPerSecond = 30;
    const totalFrames = (duration / 1000) * framesPerSecond;

    // 計算時間壓縮比例
    const totalGameTime = this.calculateTotalGameTime();
    const timeCompression = totalGameTime / (duration / 1000);

    for (let frame = 0; frame < totalFrames; frame++) {
      const frameTime = frame / framesPerSecond;
      const gameTime = frameTime * timeCompression;

      // 更新遊戲狀態
      this.updateState(gameTime);

      // 每0.5秒保存一個快照
      if (frame % (framesPerSecond / 2) === 0) {
        snapshots.push(this.getSnapshot());
      }

      // 檢查是否完成
      if (this.currentState.isFinished) {
        break;
      }
    }

    return snapshots;
  }

  /**
   * 計算預期總遊戲時間（分鐘）
   */
  calculateTotalGameTime() {
    // 簡化計算：基於平均速度估算
    const averageSpeed = 25; // km/h
    const totalDistance = this.route.totalDistance || 380;
    return (totalDistance / averageSpeed) * 60; // 轉換為分鐘
  }

  /**
   * 更新遊戲狀態
   * @param {number} gameTime - 遊戲時間（秒）
   */
  updateState(gameTime) {
    const deltaTime = 1 / 60; // 每幀時間（分鐘）

    // 計算當前速度
    const currentSpeed = this.calculateCurrentSpeed();

    // 更新距離
    const distanceDelta = (currentSpeed / 60) * deltaTime;
    this.currentState.currentDistance += distanceDelta;

    // 更新時間
    this.currentState.timeElapsed += deltaTime;

    // 更新體力
    this.updateStamina(distanceDelta, currentSpeed);

    // 更新士氣
    this.updateMorale();

    // 檢查事件觸發
    this.checkEventTriggers();

    // 檢查路段完成
    this.checkSegmentCompletion();

    // 檢查遊戲完成
    if (this.currentState.currentDistance >= this.route.totalDistance) {
      this.currentState.isFinished = true;
    }
  }

  /**
   * 計算當前速度
   */
  calculateCurrentSpeed() {
    const segment = this.getCurrentSegment();
    const averageStats = this.getAverageTeamStats();
    const equipmentBonus = this.getEquipmentBonus();
    const moraleEffects = calculateMoraleEffects(this.currentState.teamMorale);

    const speed = calculateEffectiveSpeed({
      characterSpeed: averageStats.speed,
      equipmentBonus: equipmentBonus,
      terrainFactor: segment?.terrain || 'flat',
      staminaLevel: averageStats.stamina,
      formationType: this.currentState.formation,
      positionInFormation: 'second',
      weatherCondition: this.getCurrentWeather(),
      specialAbilities: [],
      eventModifiers: moraleEffects.speedModifier
    });

    return speed;
  }

  /**
   * 獲取當前路段
   */
  getCurrentSegment() {
    if (!this.route.segments || this.route.segments.length === 0) {
      return { terrain: 'flat', distance: 30 };
    }

    let accumulatedDistance = 0;
    for (const segment of this.route.segments) {
      accumulatedDistance += segment.distance;
      if (this.currentState.currentDistance < accumulatedDistance) {
        return segment;
      }
    }

    return this.route.segments[this.route.segments.length - 1];
  }

  /**
   * 獲取團隊平均數據
   */
  getAverageTeamStats() {
    const members = this.teamConfig.members;
    const totalSpeed = members.reduce((sum, m) => sum + m.speed, 0);
    const totalStamina = Object.values(this.currentState.teamStamina).reduce((sum, s) => sum + s, 0);

    return {
      speed: totalSpeed / members.length,
      stamina: totalStamina / members.length,
      endurance: members.reduce((sum, m) => sum + m.endurance, 0) / members.length
    };
  }

  /**
   * 獲取裝備加成
   */
  getEquipmentBonus() {
    const { frame, wheelset, drivetrain } = this.equipmentConfig;
    return (frame?.bonus || 0) + (wheelset?.bonus || 0) + (drivetrain?.bonus || 0);
  }

  /**
   * 獲取當前天氣
   */
  getCurrentWeather() {
    // 簡化版：基於時間返回天氣
    const timeOfDay = (this.currentState.timeElapsed / 60) % 24;

    if (timeOfDay < 6) return 'clear';
    if (timeOfDay < 12) return 'sunny';
    if (timeOfDay < 15) return 'hot_sunny';
    if (timeOfDay < 18) return 'partly_cloudy';
    return 'clear';
  }

  /**
   * 更新體力
   */
  updateStamina(distanceDelta, currentSpeed) {
    const segment = this.getCurrentSegment();
    const weather = this.getCurrentWeather();

    this.teamConfig.members.forEach(member => {
      // 計算消耗
      const consumption = calculateStaminaConsumption({
        distance: distanceDelta,
        speed: currentSpeed,
        terrain: segment?.terrain || 'flat',
        formation: this.currentState.formation,
        position: 'second',
        weather: weather,
        bikeWeight: this.equipmentConfig.frame?.weight || 7,
        characterEndurance: member.endurance,
        isLeading: false
      });

      // 計算恢復
      const recovery = calculateRecoveryRate({
        baseRecovery: member.recovery,
        currentSpeed: currentSpeed,
        isResting: false,
        hasSupplies: false,
        teamSupport: 50,
        morale: this.currentState.teamMorale,
        weather: weather,
        restDuration: 0
      }) / 60; // 轉換為每幀恢復量

      // 更新體力
      const currentStamina = this.currentState.teamStamina[member.id];
      this.currentState.teamStamina[member.id] = Math.max(
        0,
        Math.min(100, currentStamina - consumption + recovery)
      );
    });
  }

  /**
   * 更新士氣
   */
  updateMorale() {
    const averageStamina = this.getAverageTeamStats().stamina;
    const performance = this.currentState.currentDistance > (this.route.totalDistance * 0.5) ? 'onTarget' : 'onTarget';

    const moraleChange = calculateMoraleChange({
      currentMorale: this.currentState.teamMorale,
      event: null,
      performance: performance,
      teamHarmony: 70,
      weather: this.getCurrentWeather(),
      fatigue: 100 - averageStamina
    });

    this.currentState.teamMorale = Math.max(
      0,
      Math.min(100, this.currentState.teamMorale + (moraleChange / 600))
    );
  }

  /**
   * 檢查事件觸發
   */
  checkEventTriggers() {
    // 簡化版：基於機率隨機觸發事件
    if (Math.random() < 0.001) {
      const event = {
        id: `event_${Date.now()}`,
        type: 'random',
        distance: this.currentState.currentDistance,
        timeImpact: Math.random() * 5
      };
      this.currentState.events.push(event);
      this.eventHistory.push(event);
    }
  }

  /**
   * 檢查路段完成
   */
  checkSegmentCompletion() {
    if (!this.route.segments) return;

    let accumulatedDistance = 0;
    for (let i = 0; i < this.route.segments.length; i++) {
      accumulatedDistance += this.route.segments[i].distance;

      if (
        this.currentState.currentDistance >= accumulatedDistance &&
        this.currentState.currentSegment < i + 1
      ) {
        this.currentState.currentSegment = i + 1;
        this.currentState.completedSegments.push(this.route.segments[i]);
      }
    }
  }

  /**
   * 獲取當前狀態快照
   */
  getSnapshot() {
    return {
      distance: Math.min(this.currentState.currentDistance, this.route.totalDistance),
      segment: this.currentState.currentSegment,
      time: this.currentState.timeElapsed,
      speed: this.calculateCurrentSpeed(),
      stamina: { ...this.currentState.teamStamina },
      morale: this.currentState.teamMorale,
      formation: this.currentState.formation,
      recentEvents: this.currentState.events.slice(-3),
      progress: (this.currentState.currentDistance / this.route.totalDistance) * 100,
      isFinished: this.currentState.isFinished
    };
  }

  /**
   * 獲取最終結果
   */
  getResult() {
    const averageStamina = Object.values(this.currentState.teamStamina).reduce((sum, s) => sum + s, 0) / this.teamConfig.members.length;

    const score = calculateFinalScore({
      completionTime: this.currentState.timeElapsed,
      targetTime: this.calculateTotalGameTime(),
      teamIntegrity: 100,
      suppliesUsed: 10,
      eventsHandled: this.eventHistory.length,
      specialAchievements: this.getAchievements(),
      difficulty: 'normal'
    });

    return {
      completionTime: this.currentState.timeElapsed,
      averageSpeed: this.currentState.currentDistance / (this.currentState.timeElapsed / 60),
      finalStamina: averageStamina,
      eventsEncountered: this.eventHistory.length,
      score: score,
      achievements: this.getAchievements(),
      successRate: this.calculateSuccessRate()
    };
  }

  /**
   * 獲取成就
   */
  getAchievements() {
    const achievements = [];
    const averageStamina = Object.values(this.currentState.teamStamina).reduce((sum, s) => sum + s, 0) / this.teamConfig.members.length;

    if (averageStamina > 70) {
      achievements.push('teamHarmony');
    }

    if (this.currentState.teamMorale > 70) {
      achievements.push('highMorale');
    }

    if (this.currentState.timeElapsed < this.calculateTotalGameTime() * 0.9) {
      achievements.push('speedDemon');
    }

    return achievements;
  }

  /**
   * 計算成功率
   */
  calculateSuccessRate() {
    const averageStamina = Object.values(this.currentState.teamStamina).reduce((sum, s) => sum + s, 0) / this.teamConfig.members.length;
    const completionRate = (this.currentState.currentDistance / this.route.totalDistance) * 100;

    return Math.min(100, (averageStamina * 0.3 + this.currentState.teamMorale * 0.3 + completionRate * 0.4));
  }

  /**
   * 重置模擬器
   */
  reset() {
    this.currentState = this.initializeState();
    this.eventHistory = [];
  }
}

/**
 * 快速模擬函數（便捷方法）
 * @param {Object} config - 配置選項
 * @returns {Object} 模擬結果
 */
export function quickSimulate(config = {}) {
  const simulator = new GameSimulator(
    config.team,
    config.equipment,
    config.strategy,
    config.route
  );

  const snapshots = simulator.simulate(config.duration || 30000);
  const result = simulator.getResult();

  return {
    snapshots,
    result,
    finalState: simulator.getSnapshot()
  };
}

export default GameSimulator;
