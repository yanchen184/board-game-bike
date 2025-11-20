import { useState } from 'react';
import PropTypes from 'prop-types';
import Card from './ui/Card';

/**
 * 策略配置組件
 * 讓玩家預先設定遊戲策略，遊戲將自動根據這些策略執行
 */
function StrategyConfig({ onStrategyChange, initialStrategy = {} }) {
  const [strategy, setStrategy] = useState({
    paceStrategy: initialStrategy.paceStrategy || 'balanced',
    supplyStrategy: initialStrategy.supplyStrategy || 'quick',
    climbingStrategy: initialStrategy.climbingStrategy || 'single',
    mechanicalStrategy: initialStrategy.mechanicalStrategy || 'quick_fix',
    rotationThreshold: initialStrategy.rotationThreshold || 30,
  });

  const handleChange = (key, value) => {
    const newStrategy = { ...strategy, [key]: value };
    setStrategy(newStrategy);
    if (onStrategyChange) {
      onStrategyChange(newStrategy);
    }
  };

  const strategies = {
    pace: [
      {
        id: 'conservative',
        name: '保守推進',
        icon: '🐢',
        desc: '速度 80%，體力消耗 -20%',
        pros: '✅ 高成功率，穩定完成',
        cons: '❌ 完成時間較長',
      },
      {
        id: 'balanced',
        name: '均衡推進',
        icon: '⚖️',
        desc: '標準速度和體力消耗',
        pros: '✅ 平衡的風險與回報',
        cons: '⚠️ 無明顯優勢',
      },
      {
        id: 'aggressive',
        name: '激進推進',
        icon: '🐇',
        desc: '速度 120%，體力消耗 +30%',
        pros: '✅ 最快完成時間',
        cons: '❌ 高風險，可能失敗',
      },
    ],

    supply: [
      {
        id: 'skip',
        name: '跳過補給',
        icon: '⚡',
        desc: '不停留，節省時間',
        pros: '✅ 不浪費時間',
        cons: '❌ 體力恢復少',
      },
      {
        id: 'quick',
        name: '快速補給',
        icon: '🍌',
        desc: '補給 5 分鐘，恢復 15% 體力',
        pros: '✅ 平衡時間與體力',
        cons: '⚠️ 恢復效果一般',
      },
      {
        id: 'full',
        name: '完整休息',
        icon: '🍔',
        desc: '休息 20 分鐘，恢復 50% 體力',
        pros: '✅ 大幅恢復體力',
        cons: '❌ 時間損失大',
      },
    ],

    climbing: [
      {
        id: 'single',
        name: '單線隊形',
        icon: '➡️',
        desc: '爬坡時切換為單線',
        pros: '✅ 爬坡效率最高',
        cons: '⚠️ 需要切換時間',
      },
      {
        id: 'double',
        name: '雙人並行',
        icon: '👥',
        desc: '爬坡時並行前進',
        pros: '✅ 保持彈性',
        cons: '❌ 效率略低',
      },
      {
        id: 'maintain',
        name: '維持原隊形',
        icon: '🔒',
        desc: '不切換隊形',
        pros: '✅ 不浪費時間',
        cons: '❌ 爬坡速度慢',
      },
    ],

    mechanical: [
      {
        id: 'quick_fix',
        name: '快速修復',
        icon: '🔧',
        desc: '簡單修理，5 分鐘',
        pros: '✅ 時間損失少',
        cons: '⚠️ 可能再次故障',
      },
      {
        id: 'thorough_repair',
        name: '徹底維修',
        icon: '🛠️',
        desc: '完整修理，15 分鐘',
        pros: '✅ 不會再次故障',
        cons: '❌ 時間損失大',
      },
      {
        id: 'continue',
        name: '繼續前進',
        icon: '💨',
        desc: '不修理，繼續騎行',
        pros: '✅ 不浪費時間',
        cons: '❌ 速度-20%，高風險',
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* 標題說明 */}
      <div className="bg-gradient-sky text-white p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-2">⚙️ 策略設定</h2>
        <p className="opacity-90">
          設定你的比賽策略，遊戲將自動根據這些設定執行。設定完成後觀看 30 秒動畫演示即可看到結果！
        </p>
      </div>

      {/* 1. 節奏策略 */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>1.</span>
          <span>🏃 比賽節奏</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {strategies.pace.map(s => (
            <Card
              key={s.id}
              hover
              className={`cursor-pointer transition-all ${
                strategy.paceStrategy === s.id ? 'ring-4 ring-primary-orange scale-105' : ''
              }`}
              onClick={() => handleChange('paceStrategy', s.id)}
            >
              <div className="text-center mb-3">
                <div className="text-4xl mb-2">{s.icon}</div>
                <h4 className="text-lg font-bold">{s.name}</h4>
              </div>
              <div className="text-sm text-neutral-600 mb-3">{s.desc}</div>
              <div className="text-xs space-y-1">
                <div className="text-green-600">{s.pros}</div>
                <div className="text-orange-600">{s.cons}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 2. 補給策略 */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>2.</span>
          <span>🍔 補給站策略</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {strategies.supply.map(s => (
            <Card
              key={s.id}
              hover
              className={`cursor-pointer transition-all ${
                strategy.supplyStrategy === s.id ? 'ring-4 ring-primary-orange scale-105' : ''
              }`}
              onClick={() => handleChange('supplyStrategy', s.id)}
            >
              <div className="text-center mb-3">
                <div className="text-4xl mb-2">{s.icon}</div>
                <h4 className="text-lg font-bold">{s.name}</h4>
              </div>
              <div className="text-sm text-neutral-600 mb-3">{s.desc}</div>
              <div className="text-xs space-y-1">
                <div className="text-green-600">{s.pros}</div>
                <div className="text-orange-600">{s.cons}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 3. 爬坡策略 */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>3.</span>
          <span>🏔️ 爬坡應對</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {strategies.climbing.map(s => (
            <Card
              key={s.id}
              hover
              className={`cursor-pointer transition-all ${
                strategy.climbingStrategy === s.id ? 'ring-4 ring-primary-orange scale-105' : ''
              }`}
              onClick={() => handleChange('climbingStrategy', s.id)}
            >
              <div className="text-center mb-3">
                <div className="text-4xl mb-2">{s.icon}</div>
                <h4 className="text-lg font-bold">{s.name}</h4>
              </div>
              <div className="text-sm text-neutral-600 mb-3">{s.desc}</div>
              <div className="text-xs space-y-1">
                <div className="text-green-600">{s.pros}</div>
                <div className="text-orange-600">{s.cons}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. 機械故障策略 */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>4.</span>
          <span>🔧 機械故障應對</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {strategies.mechanical.map(s => (
            <Card
              key={s.id}
              hover
              className={`cursor-pointer transition-all ${
                strategy.mechanicalStrategy === s.id ? 'ring-4 ring-primary-orange scale-105' : ''
              }`}
              onClick={() => handleChange('mechanicalStrategy', s.id)}
            >
              <div className="text-center mb-3">
                <div className="text-4xl mb-2">{s.icon}</div>
                <h4 className="text-lg font-bold">{s.name}</h4>
              </div>
              <div className="text-sm text-neutral-600 mb-3">{s.desc}</div>
              <div className="text-xs space-y-1">
                <div className="text-green-600">{s.pros}</div>
                <div className="text-orange-600">{s.cons}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 5. 體力輪替閾值 */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>5.</span>
          <span>🔄 體力輪替設定</span>
        </h3>
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-lg font-bold mb-1">自動輪替領騎閾值</div>
              <div className="text-sm text-neutral-600">
                當領騎體力低於此值時，自動換下一位隊員領騎
              </div>
            </div>
            <div className="text-4xl font-bold text-primary-orange">{strategy.rotationThreshold}%</div>
          </div>

          <input
            type="range"
            min="20"
            max="50"
            step="5"
            value={strategy.rotationThreshold}
            onChange={e => handleChange('rotationThreshold', parseInt(e.target.value))}
            className="w-full h-3 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-primary-orange"
          />

          <div className="flex justify-between text-xs text-neutral-500 mt-2">
            <span>20% (激進)</span>
            <span>35% (均衡)</span>
            <span>50% (保守)</span>
          </div>

          <div className="mt-4 p-3 bg-white rounded-lg text-sm">
            <div className="font-semibold mb-1">💡 建議：</div>
            <div className="text-neutral-600">
              {strategy.rotationThreshold <= 25 && '激進設定適合追求速度，但風險較高'}
              {strategy.rotationThreshold > 25 && strategy.rotationThreshold <= 40 && '均衡設定適合大多數情況，推薦新手使用'}
              {strategy.rotationThreshold > 40 && '保守設定確保體力充足，完成率最高'}
            </div>
          </div>
        </Card>
      </div>

      {/* 策略總結 */}
      <Card className="bg-gradient-sunset text-white">
        <h3 className="text-xl font-bold mb-4">📋 策略總結</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="opacity-80 mb-1">比賽節奏：</div>
            <div className="font-bold text-lg">
              {strategies.pace.find(s => s.id === strategy.paceStrategy)?.name}
            </div>
          </div>
          <div>
            <div className="opacity-80 mb-1">補給策略：</div>
            <div className="font-bold text-lg">
              {strategies.supply.find(s => s.id === strategy.supplyStrategy)?.name}
            </div>
          </div>
          <div>
            <div className="opacity-80 mb-1">爬坡應對：</div>
            <div className="font-bold text-lg">
              {strategies.climbing.find(s => s.id === strategy.climbingStrategy)?.name}
            </div>
          </div>
          <div>
            <div className="opacity-80 mb-1">機械故障：</div>
            <div className="font-bold text-lg">
              {strategies.mechanical.find(s => s.id === strategy.mechanicalStrategy)?.name}
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="opacity-80 mb-1">體力輪替：</div>
            <div className="font-bold text-lg">領騎體力低於 {strategy.rotationThreshold}% 時自動輪替</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

StrategyConfig.propTypes = {
  onStrategyChange: PropTypes.func,
  initialStrategy: PropTypes.shape({
    paceStrategy: PropTypes.oneOf(['conservative', 'balanced', 'aggressive']),
    supplyStrategy: PropTypes.oneOf(['skip', 'quick', 'full']),
    climbingStrategy: PropTypes.oneOf(['single', 'double', 'maintain']),
    mechanicalStrategy: PropTypes.oneOf(['quick_fix', 'thorough_repair', 'continue']),
    rotationThreshold: PropTypes.number,
  }),
};

export default StrategyConfig;
