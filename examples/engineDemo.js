/**
 * 引擎演示範例
 * 展示如何使用計算引擎和遊戲模擬器
 */

import { GameSimulator, quickSimulate } from '../src/engine/gameSimulator.js';
import {
  calculateEffectiveSpeed,
  calculateStaminaConsumption,
  calculateFinalScore
} from '../src/engine/calculationEngine.js';
import { getRoute, getCharacters, getEquipment } from '../src/utils/dataLoader.js';

console.log('=== 台北到高雄自行車遊戲引擎演示 ===\n');

// 演示1: 基礎速度計算
console.log('【演示1】基礎速度計算');
const speedParams = {
  characterSpeed: 85,
  equipmentBonus: 0.15,
  terrainFactor: 'flat',
  staminaLevel: 100,
  formationType: 'single_line',
  positionInFormation: 'second',
  weatherCondition: 'clear',
  specialAbilities: [],
  eventModifiers: 0
};

const speed = calculateEffectiveSpeed(speedParams);
console.log(`平路單列隊形，第二位置：${speed.toFixed(2)} km/h\n`);

// 演示2: 爬坡速度對比
console.log('【演示2】爬坡速度對比');
const uphillSpeed = calculateEffectiveSpeed({
  ...speedParams,
  terrainFactor: 'steep_uphill'
});
console.log(`陡坡速度：${uphillSpeed.toFixed(2)} km/h`);
console.log(`速度下降：${((1 - uphillSpeed / speed) * 100).toFixed(1)}%\n`);

// 演示3: 體力消耗計算
console.log('【演示3】體力消耗計算');
const consumptionFlat = calculateStaminaConsumption({
  distance: 10,
  speed: 30,
  terrain: 'flat',
  formation: 'single_line',
  position: 'second',
  weather: 'clear',
  bikeWeight: 7,
  characterEndurance: 80,
  isLeading: false
});

const consumptionUphill = calculateStaminaConsumption({
  distance: 10,
  speed: 20,
  terrain: 'steep_uphill',
  formation: 'single_line',
  position: 'second',
  weather: 'clear',
  bikeWeight: 7,
  characterEndurance: 80,
  isLeading: false
});

console.log(`平路10km消耗：${consumptionFlat.toFixed(2)}%`);
console.log(`陡坡10km消耗：${consumptionUphill.toFixed(2)}%\n`);

// 演示4: 遊戲模擬器
console.log('【演示4】30秒快速模擬');
try {
  const route = getRoute();
  const characters = getCharacters();
  const equipment = getEquipment();

  const teamConfig = {
    members: characters.slice(0, 3)
  };

  const equipmentConfig = {
    frame: equipment.frames[0],
    wheelset: equipment.wheelsets[0],
    drivetrain: equipment.drivetrains[0]
  };

  const strategyConfig = {
    initialFormation: 'single_line',
    paceStrategy: 'balanced',
    supplyStrategy: 'standard'
  };

  console.log('創建模擬器...');
  const simulator = new GameSimulator(
    teamConfig,
    equipmentConfig,
    strategyConfig,
    route
  );

  console.log('開始模擬（30秒壓縮演示）...');
  const snapshots = simulator.simulate(30000);

  console.log(`\n模擬完成！`);
  console.log(`總快照數：${snapshots.length}`);

  // 顯示關鍵時刻
  const keyMoments = [
    snapshots[0],
    snapshots[Math.floor(snapshots.length * 0.25)],
    snapshots[Math.floor(snapshots.length * 0.5)],
    snapshots[Math.floor(snapshots.length * 0.75)],
    snapshots[snapshots.length - 1]
  ];

  console.log('\n關鍵時刻：');
  keyMoments.forEach((snapshot, index) => {
    const labels = ['起點', '25%', '50%', '75%', '終點'];
    console.log(`${labels[index]}：`);
    console.log(`  距離：${snapshot.distance.toFixed(2)} km`);
    console.log(`  速度：${snapshot.speed.toFixed(2)} km/h`);
    console.log(`  時間：${(snapshot.time / 60).toFixed(2)} 小時`);
    console.log(`  士氣：${snapshot.morale.toFixed(0)}`);
    console.log(`  進度：${snapshot.progress.toFixed(1)}%\n`);
  });

  // 顯示最終結果
  const result = simulator.getResult();
  console.log('【最終結果】');
  console.log(`完成時間：${(result.completionTime / 60).toFixed(2)} 小時`);
  console.log(`平均速度：${result.averageSpeed.toFixed(2)} km/h`);
  console.log(`最終體力：${result.finalStamina.toFixed(0)}%`);
  console.log(`遭遇事件：${result.eventsEncountered} 個`);
  console.log(`成功率：${result.successRate.toFixed(1)}%`);
  console.log(`總分：${result.score}`);
  console.log(`成就：${result.achievements.join(', ') || '無'}\n`);

} catch (error) {
  console.error('模擬器演示出錯：', error.message);
  console.error(error.stack);
}

// 演示5: 得分計算
console.log('【演示5】得分系統');
const scoreParams = {
  completionTime: 660,
  targetTime: 720,
  teamIntegrity: 100,
  suppliesUsed: 8,
  eventsHandled: 12,
  specialAchievements: ['teamHarmony', 'speedDemon'],
  difficulty: 'normal'
};

const score = calculateFinalScore(scoreParams);
console.log(`完成時間：${scoreParams.completionTime}分鐘（目標：${scoreParams.targetTime}分鐘）`);
console.log(`團隊完整度：${scoreParams.teamIntegrity}%`);
console.log(`補給使用：${scoreParams.suppliesUsed}次`);
console.log(`事件處理：${scoreParams.eventsHandled}個`);
console.log(`特殊成就：${scoreParams.specialAchievements.join(', ')}`);
console.log(`最終得分：${score}分\n`);

console.log('=== 演示完成 ===');
