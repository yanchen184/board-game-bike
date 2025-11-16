import { calculateSpeed, calculateStaminaDrain, calculateMoraleChange } from './calculations';
import { getSegmentAtDistance, getNextSupplyStation } from '../data/routes';
import { getRandomEvent, getSupplyStationEvent } from '../data/events';

/**
 * Initialize race state
 * @param {Object} teamConfig - Team configuration
 * @param {Object} bikeConfig - Bike configuration
 * @param {Object} preparation - Preparation choices
 * @returns {Object} Initial race state
 */
export function initializeRaceState(teamConfig, bikeConfig, preparation = {}) {
  // Initialize team members with current stamina
  const team = {
    ...teamConfig,
    members: teamConfig.members.map(member => ({
      ...member,
      currentStamina: 100, // Start at full stamina
    })),
  };

  return {
    distance: 0,
    totalDistance: 380,
    timeElapsed: 0,
    speed: 0,
    team,
    bike: bikeConfig,
    weather: {
      type: 'clear',
      windDirection: 0,
      windSpeed: 0,
    },
    events: [],
    activeEffects: [], // Active temporary effects from events
    isPaused: false,
    isComplete: false,
    preparation,
    stats: {
      mechanicalFailures: 0,
      weatherChallenges: 0,
      eventsHandled: 0,
      supplyStops: 0,
    },
  };
}

/**
 * Update race state for a single frame/tick
 * @param {Object} currentState - Current race state
 * @param {number} deltaTime - Time elapsed since last update (seconds)
 * @returns {Object} Updated race state
 */
export function updateRaceState(currentState, deltaTime) {
  if (currentState.isPaused || currentState.isComplete) {
    return currentState;
  }

  // CRITICAL: All calculations must use deltaTime for frame-independence
  const newState = { ...currentState };

  // Get current terrain segment
  const currentSegment = getSegmentAtDistance(newState.distance);

  // Apply active effects
  let effectMultipliers = {
    speedModifier: 1.0,
    staminaDrain: 1.0,
  };

  // Process active effects (weather, events, etc.)
  newState.activeEffects = (newState.activeEffects || []).filter(effect => {
    if (effect.endTime && newState.timeElapsed >= effect.endTime) {
      return false; // Effect expired
    }

    // Apply effect modifiers
    if (effect.speedModifier) effectMultipliers.speedModifier *= effect.speedModifier;
    if (effect.staminaDrain) effectMultipliers.staminaDrain *= effect.staminaDrain;

    return true; // Keep active effect
  });

  // 1. Calculate current speed
  const baseSpeed = calculateSpeed(newState.team, newState.bike, newState.weather, currentSegment);
  newState.speed = baseSpeed * effectMultipliers.speedModifier;

  // 2. Update distance
  const distanceDelta = (newState.speed / 3600) * deltaTime; // speed in km/h, time in seconds
  newState.distance += distanceDelta;

  // 3. Update time
  newState.timeElapsed += deltaTime;

  // 4. Update stamina for each team member
  newState.team.members = newState.team.members.map((member, idx) => {
    const drainRate =
      calculateStaminaDrain(
        newState.speed,
        newState.team.formation,
        currentSegment,
        idx,
        newState.team.currentLeader
      ) * effectMultipliers.staminaDrain;

    const newStamina = Math.max(0, (member.currentStamina || 100) - drainRate * deltaTime);

    return {
      ...member,
      currentStamina: newStamina,
    };
  });

  // Calculate average stamina
  const avgStamina =
    newState.team.members.reduce((sum, m) => sum + m.currentStamina, 0) /
    newState.team.members.length;

  // 5. Auto-rotate leader if stamina low
  const currentLeaderStamina = newState.team.members[newState.team.currentLeader]?.currentStamina || 0;
  if (currentLeaderStamina < 30) {
    // Find member with highest stamina
    let maxStamina = -1;
    let newLeader = newState.team.currentLeader;

    newState.team.members.forEach((member, idx) => {
      if (member.currentStamina > maxStamina) {
        maxStamina = member.currentStamina;
        newLeader = idx;
      }
    });

    newState.team.currentLeader = newLeader;
  }

  // 6. Update morale
  const moraleChange = calculateMoraleChange(newState.team.morale, {
    averageStamina: avgStamina,
    distance: newState.distance,
    totalDistance: newState.totalDistance,
    weather: newState.weather.type,
  });

  newState.team.morale = Math.max(0, Math.min(100, newState.team.morale + moraleChange * deltaTime));

  // 7. Check for supply stations
  const nextStation = getNextSupplyStation(newState.distance - distanceDelta);
  if (nextStation && newState.distance >= nextStation.km) {
    // Trigger supply station event
    const supplyEvent = getSupplyStationEvent();
    if (supplyEvent) {
      newState.events.push({
        ...supplyEvent,
        timestamp: newState.timeElapsed,
        location: nextStation,
      });
    }
  }

  // 8. Random events (probability-based, check every few seconds)
  // Only check for events occasionally to avoid spam
  const shouldCheckForEvent = Math.random() < 0.001 * deltaTime; // Very low probability per frame
  if (shouldCheckForEvent) {
    const randomEvent = getRandomEvent({
      distance: newState.distance,
      weather: newState.weather.type,
      bikeCondition: newState.bike.durability || 100,
    });

    if (randomEvent) {
      newState.events.push({
        ...randomEvent,
        timestamp: newState.timeElapsed,
      });

      // Apply immediate effects
      if (randomEvent.effects) {
        // Add as active effect if it has duration
        if (randomEvent.duration) {
          newState.activeEffects.push({
            ...randomEvent.effects,
            endTime: newState.timeElapsed + randomEvent.duration,
            source: randomEvent.id,
          });
        }

        // Apply immediate morale/stamina changes
        if (randomEvent.effects.moraleChange) {
          newState.team.morale = Math.max(
            0,
            Math.min(100, newState.team.morale + randomEvent.effects.moraleChange)
          );
        }

        // Track stats
        if (randomEvent.type === 'mechanical_failure') {
          newState.stats.mechanicalFailures += 1;
        } else if (randomEvent.type === 'weather_change') {
          newState.stats.weatherChallenges += 1;
          // Update weather
          if (randomEvent.id.includes('rain')) {
            newState.weather.type = 'rainy';
          } else if (randomEvent.id.includes('wind')) {
            newState.weather.type = 'windy';
          }
        }
      }
    }
  }

  // 9. Check completion or failure conditions
  if (newState.distance >= newState.totalDistance) {
    newState.isComplete = true;
    newState.distance = newState.totalDistance; // Cap at exact distance
  }

  // Check if team has failed (all members exhausted or morale too low)
  const allExhausted = newState.team.members.every(m => m.currentStamina < 5);
  if (allExhausted || newState.team.morale < 5) {
    newState.isComplete = true;
    newState.failed = true;
  }

  return newState;
}

/**
 * Handle player choice for an event
 * @param {Object} state - Current state
 * @param {Object} event - Event object
 * @param {number} choiceIndex - Index of chosen option
 * @returns {Object} Updated state
 */
export function handleEventChoice(state, event, choiceIndex) {
  const newState = { ...state };

  if (!event.choices || !event.choices[choiceIndex]) {
    return state; // Invalid choice
  }

  const choice = event.choices[choiceIndex];
  const effects = choice.effects || {};

  // Apply time delay
  if (effects.timeDelay) {
    newState.timeElapsed += effects.timeDelay;
  }

  // Apply stamina restore
  if (effects.staminaRestore) {
    newState.team.members = newState.team.members.map(member => ({
      ...member,
      currentStamina: Math.min(100, member.currentStamina + effects.staminaRestore),
    }));
  }

  // Apply morale change
  if (effects.moraleChange) {
    newState.team.morale = Math.max(0, Math.min(100, newState.team.morale + effects.moraleChange));
  }

  // Add temporary effects
  if (effects.speedModifier && effects.speedModifier !== 1.0) {
    newState.activeEffects.push({
      speedModifier: effects.speedModifier,
      endTime: newState.timeElapsed + (choice.duration || 600),
      source: event.id + '_choice',
    });
  }

  // Track stats
  newState.stats.eventsHandled += 1;
  if (event.type === 'supply_station') {
    newState.stats.supplyStops += 1;
  }

  return newState;
}

/**
 * Pause or resume the race
 * @param {Object} state - Current state
 * @param {boolean} pause - True to pause, false to resume
 * @returns {Object} Updated state
 */
export function togglePause(state, pause) {
  return {
    ...state,
    isPaused: pause,
  };
}

/**
 * Get race summary for results screen
 * @param {Object} finalState - Final race state
 * @returns {Object} Race summary
 */
export function getRaceSummary(finalState) {
  const teamFinished = finalState.team.members.filter(m => m.currentStamina > 0).length;
  const totalTeamSize = finalState.team.members.length;
  const averageFatigue =
    1 -
    finalState.team.members.reduce((sum, m) => sum + m.currentStamina, 0) /
      (totalTeamSize * 100);

  return {
    completed: finalState.isComplete && !finalState.failed,
    failed: finalState.failed || false,
    completionTime: finalState.timeElapsed,
    finalDistance: finalState.distance,
    teamFinished,
    totalTeamSize,
    averageFatigue,
    finalMorale: finalState.team.morale,
    stats: finalState.stats,
  };
}
