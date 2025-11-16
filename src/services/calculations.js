import { FORMATION_BONUSES, FORMATION_PENALTIES, STAMINA_DRAIN, TERRAIN_TYPES } from '../utils/constants';

/**
 * Calculate current speed based on team, bike, weather, and terrain
 * @param {Object} team - Team configuration
 * @param {Object} bike - Bike configuration
 * @param {Object} weather - Weather conditions
 * @param {Object} terrain - Current terrain segment
 * @returns {number} Speed in km/h
 */
export function calculateSpeed(team, bike, weather, terrain) {
  if (!team.members || team.members.length === 0) return 0;

  // Base speed from team average
  const avgSpeed =
    team.members.reduce((sum, m) => sum + (m.baseStats?.speed || 75), 0) / team.members.length;

  // Apply formation bonus (wind resistance reduction)
  const formationBonus = FORMATION_BONUSES[team.formation] || 0;
  const formationMultiplier = 1 + formationBonus;

  // Apply bike aerodynamics (0-100 scale, convert to 0-20% bonus)
  const aeroBonus = (bike.aeroDynamics || 50) / 500; // Max 20% bonus at 100 aero
  const aeroMultiplier = 1 + aeroBonus;

  // Apply weather modifier (wind direction and speed)
  let weatherMultiplier = 1.0;
  if (weather.type === 'windy') {
    // Tailwind helps, headwind hurts
    const windEffect = Math.cos((weather.windDirection || 0) * (Math.PI / 180));
    weatherMultiplier = 1 + windEffect * 0.15; // Max ±15% from wind
  } else if (weather.type === 'rainy') {
    weatherMultiplier = 0.9; // 10% slower in rain
  }

  // Apply terrain modifier
  let terrainMultiplier = 1.0;
  const currentSegment = terrain;

  if (currentSegment) {
    switch (currentSegment.terrain) {
      case TERRAIN_TYPES.UPHILL:
        // Climbing penalty, reduced by climber bonus
        const climbingBonus =
          team.members.reduce((sum, m) => sum + (m.baseStats?.climbing || 70), 0) /
          team.members.length;
        terrainMultiplier = 0.6 + (climbingBonus / 100) * 0.3; // 60-90% speed on uphills

        // Apply formation penalty on uphill (train formation harder to maintain on climbs)
        const formationPenalty = FORMATION_PENALTIES[team.formation] || 0;
        terrainMultiplier *= (1 - formationPenalty);
        break;
      case TERRAIN_TYPES.DOWNHILL:
        terrainMultiplier = 1.2; // 20% faster downhill
        break;
      case TERRAIN_TYPES.FLAT:
      default:
        const sprintingBonus =
          team.members.reduce((sum, m) => sum + (m.baseStats?.sprinting || 70), 0) /
          team.members.length;
        terrainMultiplier = 0.95 + (sprintingBonus / 100) * 0.15; // 95-110% on flats
        break;
    }
  }

  // Calculate final speed
  const baseKmh = 25; // Base cycling speed
  const finalSpeed =
    avgSpeed *
    0.25 * // Scale factor to convert 0-100 to reasonable km/h
    formationMultiplier *
    aeroMultiplier *
    weatherMultiplier *
    terrainMultiplier;

  return Math.max(5, Math.min(45, finalSpeed)); // Clamp between 5-45 km/h
}

/**
 * Calculate stamina drain rate
 * @param {number} speed - Current speed
 * @param {string} formation - Current formation
 * @param {Object} terrain - Current terrain
 * @param {number} memberIndex - Index of team member (leader drains faster)
 * @param {number} currentLeader - Index of current leader
 * @returns {number} Stamina drain per second
 */
export function calculateStaminaDrain(speed, formation, terrain, memberIndex, currentLeader) {
  // Base drain rate (% per second)
  let baseDrain = 0.02; // 0.02% per second = 72% per hour at constant pace

  // Speed affects drain (faster = more drain)
  const speedFactor = speed / 30; // Normalized around 30 km/h
  baseDrain *= speedFactor;

  // Terrain difficulty
  if (terrain?.terrain === TERRAIN_TYPES.UPHILL) {
    baseDrain *= 1.5 + (terrain.difficulty || 3) * 0.1; // 1.5x to 2.0x on climbs
  } else if (terrain?.terrain === TERRAIN_TYPES.DOWNHILL) {
    baseDrain *= 0.7; // Easier downhill
  }

  // Leader drains faster (increased from 1.5x to 2.0x for better balance)
  const isLeader = memberIndex === currentLeader;
  if (isLeader) {
    baseDrain *= STAMINA_DRAIN.LEADER; // 2.0x more drain for leader
  }

  // Formation affects drain (better formation = less drain for non-leaders)
  if (!isLeader) {
    const formationBonus = FORMATION_BONUSES[formation] || 0;
    baseDrain *= 1 - formationBonus * 0.5; // Up to 12.5% less drain in good formation
  }

  return baseDrain;
}

/**
 * Calculate final score based on race results
 * @param {Object} raceResults - Race completion data
 * @returns {Object} Score breakdown
 */
export function calculateFinalScore(raceResults) {
  const {
    completionTime = 0, // seconds
    teamFinished = 0, // number of members who finished
    totalTeamSize = 4,
    averageFatigue = 0, // 0-1
    budgetUsed = 0,
    budgetLimit = 5000,
    eventsHandled = 0,
    mechanicalFailures = 0,
    weatherChallenges = 0,
  } = raceResults;

  // Time bonus (max 24 hours)
  const hoursUsed = completionTime / 3600;
  const timeBonus = Math.max(0, (24 - hoursUsed) * 100);

  // Team integrity bonus (all members finish = max bonus)
  const teamIntegrityRate = teamFinished / totalTeamSize;
  const teamBonus = teamIntegrityRate * 500;

  // Efficiency bonus (low fatigue = high efficiency)
  const efficiency = 1 - averageFatigue;
  const efficiencyBonus = efficiency * 300;

  // Budget efficiency (under budget = bonus)
  const budgetEfficiency = (budgetLimit - budgetUsed) / budgetLimit;
  const budgetBonus = budgetEfficiency > 0 ? budgetEfficiency * 200 : 0;

  // Event handling bonus
  const eventBonus = eventsHandled * 50;

  // Penalty for failures
  const failurePenalty = mechanicalFailures * 50 + weatherChallenges * 30;

  // Special bonuses
  let specialBonus = 0;
  if (teamFinished === totalTeamSize) specialBonus += 500; // No dropout
  if (mechanicalFailures === 0) specialBonus += 300; // No failures
  if (hoursUsed < 12) specialBonus += 400; // Very fast time
  if (efficiency > 0.7) specialBonus += 200; // High efficiency

  const totalScore = Math.round(
    Math.max(
      0,
      timeBonus + teamBonus + efficiencyBonus + budgetBonus + eventBonus + specialBonus - failurePenalty
    )
  );

  return {
    totalScore,
    breakdown: {
      timeBonus: Math.round(timeBonus),
      teamBonus: Math.round(teamBonus),
      efficiencyBonus: Math.round(efficiencyBonus),
      budgetBonus: Math.round(budgetBonus),
      eventBonus: Math.round(eventBonus),
      specialBonus: Math.round(specialBonus),
      failurePenalty: Math.round(failurePenalty),
    },
    metrics: {
      completionTime: Math.round(completionTime),
      teamIntegrityRate: Math.round(teamIntegrityRate * 100),
      efficiency: Math.round(efficiency * 100),
      budgetEfficiency: Math.round(budgetEfficiency * 100),
    },
  };
}

/**
 * Calculate morale change based on events and conditions
 * @param {Object} currentMorale - Current team morale
 * @param {Object} conditions - Current race conditions
 * @returns {number} Morale change
 */
export function calculateMoraleChange(currentMorale, conditions) {
  let moraleChange = 0;

  // Low stamina affects morale
  if (conditions.averageStamina < 30) {
    moraleChange -= 0.05; // -0.05 per second when exhausted
  } else if (conditions.averageStamina > 70) {
    moraleChange += 0.02; // +0.02 when feeling good
  }

  // Progress milestones boost morale
  const progress = conditions.distance / conditions.totalDistance;
  if (progress > 0.25 && progress < 0.26) moraleChange += 10; // 25% milestone
  if (progress > 0.5 && progress < 0.51) moraleChange += 15; // 50% milestone
  if (progress > 0.75 && progress < 0.76) moraleChange += 20; // 75% milestone
  if (progress > 0.9 && progress < 0.91) moraleChange += 25; // Final stretch!

  // Weather affects morale
  if (conditions.weather === 'rainy') {
    moraleChange -= 0.03;
  } else if (conditions.weather === 'clear') {
    moraleChange += 0.01;
  }

  return moraleChange;
}

/**
 * Calculate team's overall performance rating
 * @param {Object} team - Team configuration
 * @param {Object} bike - Bike configuration
 * @returns {Object} Performance ratings
 */
export function calculateTeamPerformance(team, bike) {
  const members = team.members || [];

  if (members.length === 0) {
    return {
      overall: 0,
      speed: 0,
      stamina: 0,
      climbing: 0,
      sprinting: 0,
      teamwork: 0,
    };
  }

  // Calculate averages
  const avgStats = {
    speed: members.reduce((sum, m) => sum + (m.baseStats?.speed || 70), 0) / members.length,
    stamina: members.reduce((sum, m) => sum + (m.baseStats?.stamina || 70), 0) / members.length,
    climbing: members.reduce((sum, m) => sum + (m.baseStats?.climbing || 70), 0) / members.length,
    sprinting: members.reduce((sum, m) => sum + (m.baseStats?.sprinting || 70), 0) / members.length,
    teamwork: members.reduce((sum, m) => sum + (m.baseStats?.teamwork || 70), 0) / members.length,
  };

  // Bike affects overall performance
  const bikeBonus = (bike.aeroDynamics || 50) / 5; // Max +20 to overall

  const overall = (Object.values(avgStats).reduce((sum, v) => sum + v, 0) / 5 + bikeBonus) / 100;

  return {
    overall: Math.round(overall * 100),
    ...Object.fromEntries(Object.entries(avgStats).map(([k, v]) => [k, Math.round(v)])),
  };
}
