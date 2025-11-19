# 📊 遊戲核心計算公式詳解

## 一、基礎速度計算系統

### 1.1 有效速度計算

```javascript
// 完整的速度計算公式
function calculateEffectiveSpeed(params) {
  const {
    characterSpeed,      // 角色基礎速度 (60-100)
    equipmentBonus,      // 裝備加成 (-0.2 ~ +0.3)
    terrainFactor,       // 地形係數 (0.5-1.3)
    staminaLevel,        // 當前體力百分比 (0-100)
    formationType,       // 隊形類型
    positionInFormation, // 在隊形中的位置
    weatherCondition,    // 天氣狀況
    specialAbilities,    // 特殊能力啟動狀態
    eventModifiers       // 事件修正值
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
```

### 1.2 地形影響計算

```javascript
function getTerrainMultiplier(terrain) {
  const terrainEffects = {
    flat: 1.0,           // 平路
    slight_uphill: 0.85, // 緩上坡 (2-5%)
    uphill: 0.70,        // 上坡 (5-8%)
    steep_uphill: 0.55,  // 陡坡 (8-12%)
    extreme_uphill: 0.40,// 極陡坡 (>12%)
    slight_downhill: 1.15,// 緩下坡
    downhill: 1.25,      // 下坡
    steep_downhill: 1.35,// 陡下坡
    technical: 0.80      // 技術路段（彎道多）
  };

  return terrainEffects[terrain] || 1.0;
}
```

### 1.3 體力影響計算（非線性衰減）

```javascript
function calculateStaminaEffect(stamina) {
  // 使用分段函數實現非線性衰減
  if (stamina >= 80) {
    return 1.0;  // 80%以上體力，無速度懲罰
  } else if (stamina >= 60) {
    // 線性衰減：1.0 -> 0.95
    return 1.0 - (80 - stamina) * 0.0025;
  } else if (stamina >= 40) {
    // 加速衰減：0.95 -> 0.85
    return 0.95 - (60 - stamina) * 0.005;
  } else if (stamina >= 20) {
    // 快速衰減：0.85 -> 0.70
    return 0.85 - (40 - stamina) * 0.0075;
  } else {
    // 極速衰減：0.70 -> 0.50
    return 0.70 - (20 - stamina) * 0.015;
  }
}
```

## 二、體力消耗計算系統

### 2.1 基礎體力消耗

```javascript
function calculateStaminaConsumption(params) {
  const {
    distance,           // 騎行距離 (km)
    speed,              // 當前速度 (km/h)
    terrain,            // 地形類型
    formation,          // 隊形
    position,           // 位置
    weather,            // 天氣
    bikeWeight,         // 車重 (kg)
    characterEndurance, // 角色耐力值
    isLeading           // 是否領騎
  } = params;

  // 基礎消耗率（每公里消耗的體力百分比）
  let baseConsumptionRate = 0.3;  // 0.3%/km 基準值

  // 速度影響（速度越快消耗越大，非線性）
  const speedFactor = Math.pow(speed / 25, 1.5);  // 25km/h為基準速度
  baseConsumptionRate *= speedFactor;

  // 地形倍率
  const terrainMultipliers = {
    flat: 1.0,
    uphill: 1.8,
    steep_uphill: 2.5,
    downhill: 0.3,      // 下坡省力
    technical: 1.3
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
    headwind: 1.4,
    tailwind: 0.8,
    rain: 1.2,
    hot: 1.3,
    cold: 1.1
  };
  baseConsumptionRate *= (weatherMultipliers[weather] || 1.0);

  // 車重影響（每公斤增加1%消耗）
  const weightPenalty = 1 + ((bikeWeight - 7) * 0.01);  // 7kg為基準重量
  baseConsumptionRate *= Math.max(0.9, weightPenalty);

  // 角色耐力減免
  const enduranceBonus = 1 - (characterEndurance / 100 * 0.3);  // 最多減少30%
  baseConsumptionRate *= enduranceBonus;

  // 計算總消耗
  const totalConsumption = distance * baseConsumptionRate;

  return Math.min(100, totalConsumption);  // 不能超過100%
}
```

### 2.2 隊形體力節省計算

```javascript
function getFormationStaminaSaving(formation, position) {
  const savings = {
    solo: { any: 0 },
    sideBySide: { left: 0.1, right: 0.15 },
    singlePaceline: {
      lead: 0,
      second: 0.20,
      third: 0.25,
      last: 0.30
    },
    trainFormation: {
      lead: 0,
      sideGuard: 0.15,
      protected: 0.40  // 被保護的主將
    },
    doublePaceline: {
      leadA: 0.05,
      leadB: 0.05,
      followA: 0.18,
      followB: 0.18
    },
    diamond: {
      front: 0,
      side: 0.20,
      back: 0.25
    }
  };

  return savings[formation]?.[position] || 0;
}
```

## 三、體力恢復計算

### 3.1 恢復速度計算

```javascript
function calculateRecoveryRate(params) {
  const {
    baseRecovery,       // 角色基礎恢復值 (60-90)
    currentSpeed,       // 當前速度
    isResting,          // 是否在休息
    hasSupplies,        // 是否有補給
    teamSupport,        // 團隊支援等級
    morale,             // 士氣值
    weather,            // 天氣
    restDuration        // 休息時長（分鐘）
  } = params;

  // 基礎恢復率（每分鐘恢復的體力百分比）
  let recoveryRate = baseRecovery / 100;  // 轉換為百分比

  // 活動狀態影響
  if (isResting) {
    // 休息時的恢復（遞減效應）
    const restEfficiency = Math.log10(restDuration + 1) / Math.log10(11);  // 10分鐘達到最大效率
    recoveryRate *= (2 + restEfficiency);  // 2-3倍恢復
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
    const supplyBonus = {
      water: 0.2,
      energyBar: 0.3,
      energyGel: 0.5,  // 立即恢復
      sportsdrink: 0.4,
      banana: 0.25
    };
    // 假設使用最佳補給
    recoveryRate *= (1 + 0.5);
  }

  // 團隊支援
  const teamSupportBonus = teamSupport / 100 * 0.3;  // 最多增加30%
  recoveryRate *= (1 + teamSupportBonus);

  // 士氣影響
  const moraleMultiplier = 0.5 + (morale / 100);  // 0.5-1.5倍
  recoveryRate *= moraleMultiplier;

  // 天氣影響恢復
  const weatherEffects = {
    clear: 1.0,
    hot: 0.7,      // 高溫降低恢復
    cold: 0.9,
    rain: 0.8
  };
  recoveryRate *= (weatherEffects[weather] || 1.0);

  // 每分鐘最多恢復5%，最少0.1%
  return Math.max(0.1, Math.min(5, recoveryRate));
}
```

## 四、士氣系統計算

### 4.1 士氣變化計算

```javascript
function calculateMoraleChange(params) {
  const {
    currentMorale,      // 當前士氣 (0-100)
    event,              // 事件類型
    performance,        // 表現（領先/落後）
    teamHarmony,        // 團隊和諧度
    weather,            // 天氣
    fatigue             // 疲勞度
  } = params;

  let moraleChange = 0;

  // 事件影響
  const eventEffects = {
    // 正面事件
    overtake: +10,          // 超越對手
    goodWeather: +5,        // 天氣轉好
    successfulClimb: +15,   // 成功爬坡
    teamworkSuccess: +12,   // 團隊配合成功
    mysteryBonus: +20,      // 神秘獎勵

    // 負面事件
    mechanicalFailure: -15, // 機械故障
    badWeather: -10,        // 惡劣天氣
    dropped: -20,           // 掉隊
    conflict: -25,          // 團隊衝突
    exhaustion: -30         // 體力耗盡
  };

  moraleChange += (eventEffects[event] || 0);

  // 表現影響（與預期比較）
  if (performance === 'leading') {
    moraleChange += 5;
  } else if (performance === 'onTarget') {
    moraleChange += 2;
  } else if (performance === 'behind') {
    moraleChange -= 5;
  } else if (performance === 'farBehind') {
    moraleChange -= 10;
  }

  // 團隊和諧度影響
  const harmonyMultiplier = 0.5 + (teamHarmony / 100);  // 0.5-1.5倍
  moraleChange *= harmonyMultiplier;

  // 疲勞度影響（高疲勞降低正面效果，增加負面效果）
  if (fatigue > 70) {
    if (moraleChange > 0) {
      moraleChange *= 0.5;  // 正面效果減半
    } else {
      moraleChange *= 1.5;  // 負面效果增加
    }
  }

  // 天氣對士氣的持續影響
  const weatherMood = {
    sunny: +0.5,    // 每10分鐘+0.5
    cloudy: 0,
    rain: -1,       // 每10分鐘-1
    storm: -2       // 每10分鐘-2
  };
  moraleChange += (weatherMood[weather] || 0);

  // 士氣慣性（極端值時變化變慢）
  if (currentMorale > 80 && moraleChange > 0) {
    moraleChange *= 0.5;  // 高士氣時更難提升
  } else if (currentMorale < 20 && moraleChange < 0) {
    moraleChange *= 0.5;  // 低士氣時下降變慢（底線）
  }

  return moraleChange;
}
```

### 4.2 士氣效果計算

```javascript
function calculateMoraleEffects(morale) {
  const effects = {
    speedModifier: 0,
    staminaModifier: 0,
    recoveryModifier: 0,
    teamworkModifier: 0
  };

  if (morale >= 80) {
    // 高士氣
    effects.speedModifier = 0.10;      // 速度+10%
    effects.staminaModifier = -0.10;   // 體力消耗-10%
    effects.recoveryModifier = 0.20;   // 恢復+20%
    effects.teamworkModifier = 0.15;   // 團隊配合+15%
  } else if (morale >= 60) {
    // 正常士氣
    effects.speedModifier = 0.05;
    effects.staminaModifier = 0;
    effects.recoveryModifier = 0.10;
    effects.teamworkModifier = 0.05;
  } else if (morale >= 40) {
    // 低落士氣
    effects.speedModifier = -0.05;
    effects.staminaModifier = 0.10;
    effects.recoveryModifier = -0.10;
    effects.teamworkModifier = -0.10;
  } else if (morale >= 20) {
    // 非常低落
    effects.speedModifier = -0.15;
    effects.staminaModifier = 0.20;
    effects.recoveryModifier = -0.30;
    effects.teamworkModifier = -0.25;
  } else {
    // 崩潰邊緣
    effects.speedModifier = -0.30;
    effects.staminaModifier = 0.40;
    effects.recoveryModifier = -0.50;
    effects.teamworkModifier = -0.50;
  }

  return effects;
}
```

## 五、風阻計算系統

### 5.1 空氣阻力計算

```javascript
function calculateWindResistance(params) {
  const {
    speed,              // 速度 (km/h)
    windSpeed,          // 風速 (km/h)
    windDirection,      // 風向（相對騎行方向的角度）
    bikeAero,           // 車輛空氣動力值 (0-100)
    riderPosition,      // 騎乘姿勢
    altitude,           // 海拔高度
    temperature         // 溫度
  } = params;

  // 空氣密度計算（考慮海拔和溫度）
  const seaLevelDensity = 1.225;  // kg/m³ at 15°C
  const altitudeFactor = Math.exp(-altitude / 8000);  // 指數衰減
  const tempFactor = 288.15 / (273.15 + temperature);  // 溫度修正
  const airDensity = seaLevelDensity * altitudeFactor * tempFactor;

  // 相對風速計算（考慮風向）
  const windAngleRad = windDirection * Math.PI / 180;
  const headwindComponent = windSpeed * Math.cos(windAngleRad);
  const relativeWindSpeed = speed + headwindComponent;

  // 風阻係數（CdA）
  const positionCdA = {
    upright: 0.45,      // 直立騎乘
    drops: 0.35,        // 下把位
    aero: 0.30,         // 空氣動力姿勢
    tucked: 0.25        // 極限壓低
  };

  let CdA = positionCdA[riderPosition] || 0.35;

  // 裝備空氣動力修正
  const aeroReduction = bikeAero / 100 * 0.1;  // 最多減少10%
  CdA *= (1 - aeroReduction);

  // 風阻功率計算 (簡化公式)
  // P = 0.5 * ρ * CdA * v³
  const speedMs = relativeWindSpeed / 3.6;  // 轉換為 m/s
  const windPower = 0.5 * airDensity * CdA * Math.pow(speedMs, 3);

  // 轉換為速度懲罰百分比（簡化）
  const speedPenalty = Math.min(0.5, windPower / 1000);  // 最多50%懲罰

  return {
    windPower,
    speedPenalty,
    effectiveSpeed: speed * (1 - speedPenalty)
  };
}
```

## 六、時間計算系統

### 6.1 路段時間計算

```javascript
function calculateSegmentTime(params) {
  const {
    distance,           // 路段距離 (km)
    baseSpeed,          // 基礎速度 (km/h)
    terrain,            // 地形
    weather,            // 天氣
    formation,          // 隊形
    stamina,            // 體力
    events              // 事件列表
  } = params;

  // 計算有效速度（整合所有因素）
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
  events.forEach(event => {
    eventDelays += event.timeImpact || 0;
  });

  // 轉換為分鐘
  segmentTime = segmentTime * 60 + eventDelays;

  return segmentTime;
}
```

### 6.2 總時間計算

```javascript
function calculateTotalTime(segments, bonuses, penalties) {
  // 計算所有路段時間總和
  let totalTime = 0;

  segments.forEach(segment => {
    totalTime += calculateSegmentTime(segment);
  });

  // 應用獎勵時間
  const totalBonus = bonuses.reduce((sum, bonus) => {
    return sum + calculateBonus(bonus);
  }, 0);

  // 應用懲罰時間
  const totalPenalty = penalties.reduce((sum, penalty) => {
    return sum + calculatePenalty(penalty);
  }, 0);

  // 最終時間
  const finalTime = totalTime - totalBonus + totalPenalty;

  // 返回格式化結果
  return {
    rawTime: totalTime,
    bonusTime: totalBonus,
    penaltyTime: totalPenalty,
    finalTime: finalTime,
    formatted: formatTime(finalTime)
  };
}

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const secs = Math.floor((minutes % 1) * 60);
  return `${hours}小時${mins}分${secs}秒`;
}
```

## 七、得分計算系統

### 7.1 最終得分計算

```javascript
function calculateFinalScore(params) {
  const {
    completionTime,     // 完成時間（分鐘）
    targetTime,         // 目標時間（分鐘）
    teamIntegrity,      // 團隊完整度 (0-100%)
    suppliesUsed,       // 使用的補給數量
    eventsHandled,      // 事件處理成功率
    specialAchievements // 特殊成就
  } = params;

  let score = 10000;  // 基礎分數

  // 時間分數（越快越高）
  const timeBonus = Math.max(0, (targetTime - completionTime) * 10);
  score += timeBonus;

  // 團隊完整度獎勵
  const teamBonus = teamIntegrity * 20;  // 每1%完整度20分
  score += teamBonus;

  // 資源效率（補給使用越少越好）
  const efficiencyBonus = Math.max(0, (20 - suppliesUsed) * 50);
  score += efficiencyBonus;

  // 事件處理獎勵
  const eventBonus = eventsHandled * 500;  // 每個成功處理500分
  score += eventBonus;

  // 特殊成就加分
  const achievementPoints = {
    noDropout: 1000,        // 無人掉隊
    perfectFormation: 800,  // 完美隊形保持
    mountainKing: 600,      // 所有爬坡第一
    speedDemon: 700,        // 平均速度>30km/h
    ironWill: 900,          // 從未休息
    weatherMaster: 500,     // 完美應對所有天氣
    mechanicalGenius: 400,  // 無機械故障
    teamHarmony: 600        // 士氣從未低於70
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

  score *= (difficultyMultiplier[params.difficulty] || 1.0);

  return Math.floor(score);
}
```

### 7.2 排名計算

```javascript
function calculateRanking(score, allScores) {
  // 計算百分位排名
  const betterThan = allScores.filter(s => s < score).length;
  const percentile = (betterThan / allScores.length) * 100;

  // 評級系統
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
```

## 八、平衡性驗證公式

### 8.1 策略效率計算

```javascript
function validateStrategyBalance() {
  const strategies = [
    { name: 'aggressive', risk: 0.8, reward: 1.3 },
    { name: 'balanced', risk: 0.5, reward: 1.0 },
    { name: 'conservative', risk: 0.2, reward: 0.8 },
    { name: 'teamwork', risk: 0.4, reward: 1.1 }
  ];

  strategies.forEach(strategy => {
    const expectedValue = calculateExpectedValue(strategy);
    const variance = calculateVariance(strategy);
    const sharpRatio = expectedValue / Math.sqrt(variance);

    console.log(`${strategy.name}: EV=${expectedValue}, Sharp=${sharpRatio}`);

    // 驗證所有策略的夏普比率應該相近（±15%）
    assert(Math.abs(sharpRatio - 1.0) < 0.15);
  });
}
```

### 8.2 角色平衡驗證

```javascript
function validateCharacterBalance() {
  const characters = getAllCharacters();

  characters.forEach(char => {
    // 計算角色總值
    const totalStats =
      char.speed +
      char.stamina +
      char.climbing +
      char.sprint +
      char.recovery +
      char.teamwork;

    // 計算特殊能力價值
    const abilityValue = evaluateAbility(char.specialAbility);

    // 總體價值應該在420-460之間
    const overallValue = totalStats + abilityValue;

    assert(overallValue >= 420 && overallValue <= 460,
      `${char.name} is unbalanced: ${overallValue}`);
  });
}
```

## 總結

這些公式構成了遊戲的核心計算引擎。每個公式都經過精心設計，確保：

1. **真實性**：基於實際騎行物理原理
2. **平衡性**：不同策略有相近的期望收益
3. **深度**：多個變量相互影響，創造策略深度
4. **可讀性**：玩家能夠理解和預測結果

開發者可以直接使用這些公式實現遊戲邏輯，並根據測試結果微調參數。