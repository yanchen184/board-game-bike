import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { runAutoSimulation, interpolateSnapshot } from '../services/AutoGameSimulator';
import gsap from 'gsap';

/**
 * AutoGameSimulator Component
 * 自動遊戲模擬器組件 - 播放30秒動畫演示
 */
function AutoGameSimulator({ onSimulationComplete }) {
  const teamMembers = useSelector(state => state.team.members);
  const bikeStats = useSelector(state => state.bike);
  const formation = useSelector(state => state.team.formation);
  const strategy = useSelector(state => state.strategy);

  const [isRunning, setIsRunning] = useState(false);
  const [currentSnapshot, setCurrentSnapshot] = useState(null);
  const [progress, setProgress] = useState(0);
  const [simulationResult, setSimulationResult] = useState(null);

  const animationRef = useRef(null);
  const snapshotsRef = useRef([]);

  useEffect(() => {
    // 組件掛載後自動開始模擬
    startSimulation();

    return () => {
      // 清理動畫
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, []);

  const startSimulation = async () => {
    setIsRunning(true);

    // 準備配置
    const team = {
      members: teamMembers,
    };

    const bike = {
      aeroDynamics: bikeStats.totalAero || 50,
      weight: bikeStats.totalWeight || 10,
      durability: 100,
    };

    // 運行自動模擬
    const result = runAutoSimulation({
      team,
      bike,
      formation,
      strategy,
      targetDuration: 30, // 30秒動畫
      fps: 30,
    });

    // 保存快照和結果
    snapshotsRef.current = result.snapshots;
    setSimulationResult(result);

    // 開始播放動畫
    playAnimation(result.snapshots, result.targetDuration);
  };

  const playAnimation = (snapshots, duration) => {
    if (snapshots.length === 0) return;

    // 使用GSAP播放30秒動畫
    const tl = gsap.timeline({
      onComplete: () => {
        setIsRunning(false);
        // 通知完成
        if (onSimulationComplete && simulationResult) {
          onSimulationComplete(simulationResult);
        }
      },
    });

    animationRef.current = tl;

    // 創建進度動畫對象
    const progressObj = { value: 0 };

    tl.to(progressObj, {
      value: 1,
      duration,
      ease: 'none',
      onUpdate: () => {
        const currentProgress = progressObj.value;
        setProgress(currentProgress);

        // 計算當前應該顯示第幾幀
        const totalFrames = snapshots[snapshots.length - 1]?.frame || 900;
        const currentFrame = Math.floor(currentProgress * totalFrames);

        // 插值獲取當前快照
        const snapshot = interpolateSnapshot(snapshots, currentFrame);
        setCurrentSnapshot(snapshot);
      },
    });
  };

  // 格式化時間顯示
  const formatTime = seconds => {
    if (!seconds) return '00:00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 格式化距離顯示
  const formatDistance = km => {
    if (!km) return '0.0';
    return km.toFixed(1);
  };

  return (
    <div className="auto-game-simulator w-full h-full flex flex-col" data-testid="auto-game-simulator">
      {/* 進度條 */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-neutral-600 mb-2">
          <span>模擬進度</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-sunset transition-all duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* 主要顯示區域 */}
      {currentSnapshot && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左側：比賽資訊 */}
          <div className="space-y-4">
            {/* 距離和時間 */}
            <div className="bg-gradient-sky text-white p-6 rounded-xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm opacity-90 mb-1">已完成</div>
                  <div className="text-3xl font-bold">
                    {formatDistance(currentSnapshot.distance)} km
                  </div>
                  <div className="text-xs opacity-75 mt-1">/ 380 km</div>
                </div>
                <div>
                  <div className="text-sm opacity-90 mb-1">用時</div>
                  <div className="text-3xl font-bold">
                    {formatTime(currentSnapshot.timeElapsed)}
                  </div>
                </div>
              </div>
            </div>

            {/* 當前速度和地形 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-neutral-600 mb-1">當前速度</div>
                  <div className="text-2xl font-bold text-primary-orange">
                    {currentSnapshot.speed?.toFixed(1) || '0.0'} km/h
                  </div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600 mb-1">地形</div>
                  <div className="text-2xl font-bold">
                    {currentSnapshot.terrain === 'uphill' && '🏔️ 爬坡'}
                    {currentSnapshot.terrain === 'downhill' && '⬇️ 下坡'}
                    {currentSnapshot.terrain === 'flat' && '➡️ 平路'}
                  </div>
                </div>
              </div>
            </div>

            {/* 隊形和士氣 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-neutral-600 mb-1">當前隊形</div>
                  <div className="text-lg font-bold">
                    {currentSnapshot.formation === 'single' && '單線隊形'}
                    {currentSnapshot.formation === 'double' && '雙線並行'}
                    {currentSnapshot.formation === 'train' && '火車陣型'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600 mb-1">團隊士氣</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          currentSnapshot.morale > 70
                            ? 'bg-primary-green'
                            : currentSnapshot.morale > 40
                            ? 'bg-accent-yellow'
                            : 'bg-accent-red'
                        }`}
                        style={{ width: `${currentSnapshot.morale}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold">{Math.round(currentSnapshot.morale)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右側：隊員狀態 */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">隊員體力狀態</h3>
            {currentSnapshot.members?.map((member, idx) => (
              <div
                key={member.id}
                className={`bg-white p-4 rounded-xl shadow-md transition-all ${
                  idx === currentSnapshot.leader ? 'ring-4 ring-primary-orange' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{member.name}</span>
                    {idx === currentSnapshot.leader && (
                      <span className="text-xs bg-primary-orange text-white px-2 py-1 rounded-full">
                        領騎中
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold">{Math.round(member.stamina)}%</span>
                </div>

                <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      member.stamina > 70
                        ? 'bg-primary-green'
                        : member.stamina > 40
                        ? 'bg-accent-yellow'
                        : 'bg-accent-red'
                    }`}
                    style={{ width: `${member.stamina}%` }}
                  />
                </div>

                {member.stamina < 30 && (
                  <div className="text-xs text-accent-red mt-1">⚠️ 體力不足，即將輪替</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 載入狀態 */}
      {!currentSnapshot && isRunning && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">🚴</div>
            <div className="text-xl font-bold">正在初始化比賽...</div>
          </div>
        </div>
      )}
    </div>
  );
}

AutoGameSimulator.propTypes = {
  onSimulationComplete: PropTypes.func,
};

export default AutoGameSimulator;
