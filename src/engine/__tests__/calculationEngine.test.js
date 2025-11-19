/**
 * 計算引擎測試套件
 */

import { describe, it, expect } from 'vitest';
import {
  calculateEffectiveSpeed,
  calculateStaminaConsumption,
  calculateRecoveryRate,
  calculateMoraleChange,
  calculateMoraleEffects,
  getTerrainMultiplier,
  calculateStaminaEffect,
  getFormationBonus,
  getWeatherEffect,
  calculateSegmentTime,
  calculateTotalTime,
  formatTime,
  calculateFinalScore,
  calculateRanking
} from '../calculationEngine';

describe('Calculation Engine', () => {
  describe('calculateEffectiveSpeed', () => {
    it('should calculate base speed correctly', () => {
      const params = {
        characterSpeed: 80,
        equipmentBonus: 0.1,
        terrainFactor: 'flat',
        staminaLevel: 100,
        formationType: 'single_line',
        positionInFormation: 'second',
        weatherCondition: 'clear',
        specialAbilities: [],
        eventModifiers: 0
      };

      const speed = calculateEffectiveSpeed(params);
      expect(speed).toBeGreaterThan(0);
      expect(speed).toBeLessThan(50);
    });

    it('should respect minimum speed limit', () => {
      const params = {
        characterSpeed: 20,
        equipmentBonus: -0.5,
        terrainFactor: 'steep_uphill',
        staminaLevel: 10,
        formationType: 'solo',
        positionInFormation: 'any',
        weatherCondition: 'storm',
        specialAbilities: [],
        eventModifiers: -0.5
      };

      const speed = calculateEffectiveSpeed(params);
      expect(speed).toBeGreaterThanOrEqual(10);
    });

    it('should respect maximum speed limit', () => {
      const params = {
        characterSpeed: 100,
        equipmentBonus: 0.5,
        terrainFactor: 'steep_downhill',
        staminaLevel: 100,
        formationType: 'echelon',
        positionInFormation: 'protected',
        weatherCondition: 'tailwind',
        specialAbilities: ['sprint_burst', 'aero_specialist'],
        eventModifiers: 0.5
      };

      const speed = calculateEffectiveSpeed(params);
      expect(speed).toBeLessThanOrEqual(50);
    });
  });

  describe('getTerrainMultiplier', () => {
    it('should return correct multipliers for different terrains', () => {
      expect(getTerrainMultiplier('flat')).toBe(1.0);
      expect(getTerrainMultiplier('uphill')).toBe(0.70);
      expect(getTerrainMultiplier('steep_uphill')).toBe(0.55);
      expect(getTerrainMultiplier('downhill')).toBe(1.25);
    });

    it('should return default multiplier for unknown terrain', () => {
      expect(getTerrainMultiplier('unknown')).toBe(1.0);
    });
  });

  describe('calculateStaminaEffect', () => {
    it('should return 1.0 for high stamina', () => {
      expect(calculateStaminaEffect(100)).toBe(1.0);
      expect(calculateStaminaEffect(85)).toBe(1.0);
      expect(calculateStaminaEffect(80)).toBe(1.0);
    });

    it('should decrease with lower stamina', () => {
      const effect70 = calculateStaminaEffect(70);
      const effect50 = calculateStaminaEffect(50);
      const effect30 = calculateStaminaEffect(30);

      expect(effect70).toBeGreaterThan(effect50);
      expect(effect50).toBeGreaterThan(effect30);
    });

    it('should not go below minimum threshold', () => {
      const effect = calculateStaminaEffect(0);
      expect(effect).toBeGreaterThanOrEqual(0.5);
    });
  });

  describe('getFormationBonus', () => {
    it('should return correct bonus for single line formation', () => {
      expect(getFormationBonus('single_line', 'lead')).toBe(0);
      expect(getFormationBonus('single_line', 'second')).toBe(0.20);
      expect(getFormationBonus('single_line', 'third')).toBe(0.25);
      expect(getFormationBonus('single_line', 'last')).toBe(0.30);
    });

    it('should return 0 for solo formation', () => {
      expect(getFormationBonus('solo', 'any')).toBe(0);
    });

    it('should return 0 for unknown formation', () => {
      expect(getFormationBonus('unknown', 'any')).toBe(0);
    });
  });

  describe('getWeatherEffect', () => {
    it('should return correct effects for different weather', () => {
      expect(getWeatherEffect('clear')).toBe(1.0);
      expect(getWeatherEffect('headwind')).toBe(0.75);
      expect(getWeatherEffect('tailwind')).toBe(1.15);
      expect(getWeatherEffect('rain')).toBe(0.80);
    });
  });

  describe('calculateStaminaConsumption', () => {
    it('should calculate consumption correctly', () => {
      const params = {
        distance: 10,
        speed: 25,
        terrain: 'flat',
        formation: 'single_line',
        position: 'second',
        weather: 'clear',
        bikeWeight: 7,
        characterEndurance: 70,
        isLeading: false
      };

      const consumption = calculateStaminaConsumption(params);
      expect(consumption).toBeGreaterThan(0);
      expect(consumption).toBeLessThanOrEqual(100);
    });

    it('should consume more stamina on uphill terrain', () => {
      const flatParams = {
        distance: 10,
        speed: 25,
        terrain: 'flat',
        formation: 'solo',
        position: 'any'
      };

      const uphillParams = {
        ...flatParams,
        terrain: 'steep_uphill'
      };

      const flatConsumption = calculateStaminaConsumption(flatParams);
      const uphillConsumption = calculateStaminaConsumption(uphillParams);

      expect(uphillConsumption).toBeGreaterThan(flatConsumption);
    });

    it('should consume more stamina when leading', () => {
      const params = {
        distance: 10,
        speed: 25,
        terrain: 'flat',
        formation: 'single_line',
        position: 'second',
        isLeading: false
      };

      const leadingParams = { ...params, isLeading: true };

      const normalConsumption = calculateStaminaConsumption(params);
      const leadingConsumption = calculateStaminaConsumption(leadingParams);

      expect(leadingConsumption).toBeGreaterThan(normalConsumption);
    });
  });

  describe('calculateRecoveryRate', () => {
    it('should calculate recovery rate correctly', () => {
      const params = {
        baseRecovery: 70,
        currentSpeed: 0,
        isResting: true,
        hasSupplies: false,
        teamSupport: 50,
        morale: 70,
        weather: 'clear',
        restDuration: 10
      };

      const recoveryRate = calculateRecoveryRate(params);
      expect(recoveryRate).toBeGreaterThan(0);
      expect(recoveryRate).toBeLessThanOrEqual(5);
    });

    it('should recover more when resting', () => {
      const baseParams = {
        baseRecovery: 70,
        currentSpeed: 20,
        isResting: false
      };

      const restingParams = {
        ...baseParams,
        currentSpeed: 0,
        isResting: true,
        restDuration: 10
      };

      const normalRecovery = calculateRecoveryRate(baseParams);
      const restingRecovery = calculateRecoveryRate(restingParams);

      expect(restingRecovery).toBeGreaterThan(normalRecovery);
    });

    it('should not recover at high speed', () => {
      const params = {
        baseRecovery: 70,
        currentSpeed: 35,
        isResting: false
      };

      const recoveryRate = calculateRecoveryRate(params);
      expect(recoveryRate).toBe(0);
    });
  });

  describe('calculateMoraleChange', () => {
    it('should increase morale on positive events', () => {
      const params = {
        currentMorale: 70,
        event: 'successfulClimb',
        performance: 'leading',
        teamHarmony: 70,
        weather: 'clear',
        fatigue: 30
      };

      const moraleChange = calculateMoraleChange(params);
      expect(moraleChange).toBeGreaterThan(0);
    });

    it('should decrease morale on negative events', () => {
      const params = {
        currentMorale: 70,
        event: 'mechanicalFailure',
        performance: 'behind',
        teamHarmony: 70,
        weather: 'rain',
        fatigue: 80
      };

      const moraleChange = calculateMoraleChange(params);
      expect(moraleChange).toBeLessThan(0);
    });
  });

  describe('calculateMoraleEffects', () => {
    it('should provide positive effects at high morale', () => {
      const effects = calculateMoraleEffects(85);

      expect(effects.speedModifier).toBeGreaterThan(0);
      expect(effects.staminaModifier).toBeLessThan(0);
      expect(effects.recoveryModifier).toBeGreaterThan(0);
    });

    it('should provide negative effects at low morale', () => {
      const effects = calculateMoraleEffects(30);

      expect(effects.speedModifier).toBeLessThan(0);
      expect(effects.staminaModifier).toBeGreaterThan(0);
      expect(effects.recoveryModifier).toBeLessThan(0);
    });
  });

  describe('calculateSegmentTime', () => {
    it('should calculate segment time correctly', () => {
      const params = {
        distance: 30,
        baseSpeed: 30,
        terrain: 'flat',
        weather: 'clear',
        formation: 'single_line',
        stamina: 100,
        events: []
      };

      const time = calculateSegmentTime(params);
      expect(time).toBeGreaterThan(0);
    });

    it('should add event delays to segment time', () => {
      const baseParams = {
        distance: 30,
        baseSpeed: 30,
        terrain: 'flat',
        events: []
      };

      const eventsParams = {
        ...baseParams,
        events: [{ timeImpact: 10 }, { timeImpact: 5 }]
      };

      const baseTime = calculateSegmentTime(baseParams);
      const eventsTime = calculateSegmentTime(eventsParams);

      expect(eventsTime).toBeGreaterThan(baseTime);
      expect(eventsTime - baseTime).toBeCloseTo(15, 1);
    });
  });

  describe('calculateTotalTime', () => {
    it('should calculate total time correctly', () => {
      const segments = [
        { distance: 30, baseSpeed: 30, terrain: 'flat', stamina: 100 },
        { distance: 30, baseSpeed: 25, terrain: 'uphill', stamina: 90 }
      ];

      const result = calculateTotalTime(segments);

      expect(result.rawTime).toBeGreaterThan(0);
      expect(result.finalTime).toBeGreaterThan(0);
      expect(result.formatted).toContain('小時');
    });

    it('should apply bonuses and penalties', () => {
      const segments = [
        { distance: 30, baseSpeed: 30, terrain: 'flat', stamina: 100 }
      ];

      const bonuses = [{ value: 10 }];
      const penalties = [{ value: 5 }];

      const result = calculateTotalTime(segments, bonuses, penalties);

      expect(result.bonusTime).toBe(10);
      expect(result.penaltyTime).toBe(5);
      expect(result.finalTime).toBe(result.rawTime - 10 + 5);
    });
  });

  describe('formatTime', () => {
    it('should format time correctly', () => {
      expect(formatTime(125)).toMatch(/2小時5分0秒/);
      expect(formatTime(60)).toMatch(/1小時0分0秒/);
      expect(formatTime(30.5)).toMatch(/0小時30分30秒/);
    });
  });

  describe('calculateFinalScore', () => {
    it('should calculate score correctly', () => {
      const params = {
        completionTime: 600,
        targetTime: 720,
        teamIntegrity: 100,
        suppliesUsed: 10,
        eventsHandled: 5,
        specialAchievements: [],
        difficulty: 'normal'
      };

      const score = calculateFinalScore(params);
      expect(score).toBeGreaterThan(0);
    });

    it('should give bonus for faster completion', () => {
      const fastParams = {
        completionTime: 600,
        targetTime: 720,
        teamIntegrity: 100,
        suppliesUsed: 10,
        eventsHandled: 5,
        specialAchievements: [],
        difficulty: 'normal'
      };

      const slowParams = {
        ...fastParams,
        completionTime: 720
      };

      const fastScore = calculateFinalScore(fastParams);
      const slowScore = calculateFinalScore(slowParams);

      expect(fastScore).toBeGreaterThan(slowScore);
    });

    it('should apply difficulty multiplier', () => {
      const normalParams = {
        completionTime: 720,
        targetTime: 720,
        teamIntegrity: 100,
        suppliesUsed: 10,
        eventsHandled: 5,
        specialAchievements: [],
        difficulty: 'normal'
      };

      const hardParams = { ...normalParams, difficulty: 'hard' };

      const normalScore = calculateFinalScore(normalParams);
      const hardScore = calculateFinalScore(hardParams);

      expect(hardScore).toBeGreaterThan(normalScore);
    });
  });

  describe('calculateRanking', () => {
    it('should calculate ranking correctly', () => {
      const score = 15000;
      const allScores = [10000, 12000, 14000, 16000, 18000];

      const ranking = calculateRanking(score, allScores);

      expect(ranking.score).toBe(15000);
      expect(ranking.percentile).toBeGreaterThanOrEqual(0);
      expect(ranking.percentile).toBeLessThanOrEqual(100);
      expect(['S', 'A', 'B', 'C', 'D', 'E']).toContain(ranking.grade);
      expect(ranking.rank).toBeGreaterThan(0);
      expect(ranking.rank).toBeLessThanOrEqual(allScores.length);
    });

    it('should assign S grade for top 5%', () => {
      const score = 20000;
      const allScores = Array(100).fill(10000);
      allScores[0] = 20000;

      const ranking = calculateRanking(score, allScores);

      expect(ranking.grade).toBe('S');
      expect(ranking.percentile).toBeGreaterThanOrEqual(95);
    });
  });
});
