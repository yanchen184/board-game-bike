import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import Loading from '../components/ui/Loading';
import HelpModal from '../components/HelpModal';
import TutorialOverlay from '../components/TutorialOverlay';
import SupplyStationModal from '../components/SupplyStationModal';
import { useGameLoop } from '../hooks/useGameLoop';
import { initializeRaceState, updateRaceState, getRaceSummary } from '../services/gameEngine';
import { getSegmentAtDistance, getNextSupplyStation } from '../data/routes';

function GamePage() {
  const navigate = useNavigate();
  const teamMembers = useSelector(state => state.team.members);
  const teamFormation = useSelector(state => state.team.formation);
  const bikeConfig = useSelector(state => state.bike);

  const [gameState, setGameState] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [timeScale, setTimeScale] = useState(10); // 預設 10x 加速
  const [showSupplyStation, setShowSupplyStation] = useState(false);
  const [currentSupplyStation, setCurrentSupplyStation] = useState(null);
  const [lastSupplyCheck, setLastSupplyCheck] = useState(0);

  // Initialize race
  useEffect(() => {
    if (teamMembers.length < 2) {
      navigate('/setup');
      return;
    }

    const initialState = initializeRaceState(
      { members: teamMembers, formation: teamFormation, currentLeader: 0, morale: 100 },
      bikeConfig
    );

    setGameState(initialState);

    // Check if this is first time playing
    const hasSeenTutorial = localStorage.getItem('hasSeenGameTutorial');
    if (!hasSeenTutorial) {
      // Show tutorial after a short delay
      setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
    }
  }, []);

  const handleTutorialComplete = useCallback(() => {
    localStorage.setItem('hasSeenGameTutorial', 'true');
    setShowTutorial(false);
  }, []);

  // Game loop
  const handleGameTick = useCallback(
    deltaTime => {
      if (!gameState || showSupplyStation) return;

      const newState = updateRaceState(gameState, deltaTime);

      // Check for supply stations
      const nextStation = getNextSupplyStation(newState.distance);
      if (nextStation && newState.distance >= nextStation.distance && newState.distance - lastSupplyCheck > 10) {
        // Reached a supply station
        setLastSupplyCheck(newState.distance);
        setCurrentSupplyStation(nextStation);
        setShowSupplyStation(true);
        setIsPaused(true);
        toast.success(`到達補給站：${nextStation.name}`);
        setGameState(newState);
        return;
      }

      setGameState(newState);

      // Check if race is complete
      if (newState.isComplete && !gameState.isComplete) {
        const summary = getRaceSummary(newState);
        // Store results and navigate
        setTimeout(() => {
          navigate('/results', { state: { summary, gameState: newState } });
        }, 1000);
      }
    },
    [gameState, navigate, showSupplyStation, lastSupplyCheck]
  );

  useGameLoop(handleGameTick, isPaused || !gameState || showSupplyStation, timeScale);

  // Memoized calculations
  const currentSegment = useMemo(
    () => (gameState ? getSegmentAtDistance(gameState.distance) : null),
    [gameState?.distance]
  );

  const progress = useMemo(
    () => (gameState ? (gameState.distance / gameState.totalDistance) * 100 : 0),
    [gameState?.distance, gameState?.totalDistance]
  );

  const avgStamina = useMemo(
    () =>
      gameState
        ? gameState.team.members.reduce((sum, m) => sum + (m.currentStamina || 0), 0) /
          gameState.team.members.length
        : 0,
    [gameState?.team.members]
  );

  // Format time as HH:MM:SS - memoized
  const formatTime = useCallback(seconds => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handlePauseToggle = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const handleBackToSetup = useCallback(() => {
    navigate('/setup');
  }, [navigate]);

  // 換領騎功能
  const handleChangeLeader = useCallback(() => {
    if (!gameState) return;

    const currentLeader = gameState.team.currentLeader;
    const nextLeader = (currentLeader + 1) % gameState.team.members.length;

    setGameState(prev => ({
      ...prev,
      team: {
        ...prev.team,
        currentLeader: nextLeader,
      },
    }));

    toast.success(`${gameState.team.members[nextLeader].name} 接手領騎！`);
  }, [gameState]);

  // 補給站決策處理
  const handleSupplyDecision = useCallback(
    decision => {
      setShowSupplyStation(false);
      setIsPaused(false);

      if (decision === 'rest') {
        // 停留補給：恢復更多體力但損失時間
        setGameState(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 15 * 60, // 增加 15 分鐘
          team: {
            ...prev.team,
            members: prev.team.members.map(m => ({
              ...m,
              currentStamina: Math.min(100, m.currentStamina + 30),
            })),
          },
        }));
        toast.success('✅ 完成補給！體力恢復 30%，時間 +15 分鐘');
      } else {
        // 快速通過：少量恢復體力
        setGameState(prev => ({
          ...prev,
          team: {
            ...prev.team,
            members: prev.team.members.map(m => ({
              ...m,
              currentStamina: Math.min(100, m.currentStamina + 10),
            })),
          },
        }));
        toast.success('⚡ 快速通過！體力恢復 10%');
      }
    },
    []
  );

  if (!gameState) {
    return <Loading fullscreen message="初始化比賽..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-radial py-8 px-4" data-testid="game-page">
      <div className="max-w-6xl mx-auto">
        {/* Game Title & Info Banner */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border-l-4 border-primary-orange">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-1">
                🚴 一日北高挑戰進行中
              </h2>
              <p className="text-sm text-neutral-600">
                遊戲自動進行中 · 關注團隊狀態並適時做出決策
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-neutral-500">完成目標</div>
              <div className="text-lg font-bold text-primary-orange">
                24小時內抵達高雄
              </div>
            </div>
          </div>
        </div>

        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-dark p-6 rounded-xl text-white hover:scale-105 transition-transform" data-testid="distance-stat">
            <div className="text-sm opacity-80 mb-1 flex items-center gap-2">
              <span>📍</span>
              <span>距離</span>
            </div>
            <div className="text-3xl font-bold" data-testid="distance-value">
              {Math.round(gameState.distance)} / {gameState.totalDistance} km
            </div>
            <div className="text-xs opacity-60 mt-1">
              剩餘 {gameState.totalDistance - Math.round(gameState.distance)} 公里
            </div>
          </div>

          <div className="glass-dark p-6 rounded-xl text-white hover:scale-105 transition-transform" data-testid="time-stat">
            <div className="text-sm opacity-80 mb-1 flex items-center gap-2">
              <span>⏱️</span>
              <span>時間</span>
            </div>
            <div className="text-3xl font-bold" data-testid="time-value">{formatTime(gameState.timeElapsed)}</div>
            <div className="text-xs opacity-60 mt-1">
              限時 24:00:00
            </div>
          </div>

          <div className="glass-dark p-6 rounded-xl text-white hover:scale-105 transition-transform" data-testid="speed-stat">
            <div className="text-sm opacity-80 mb-1 flex items-center gap-2">
              <span>💨</span>
              <span>速度</span>
            </div>
            <div className="text-3xl font-bold" data-testid="speed-value">{Math.round(gameState.speed)} km/h</div>
            <div className="text-xs opacity-60 mt-1">
              預估完成時間: {((gameState.totalDistance - gameState.distance) / gameState.speed).toFixed(1)}h
            </div>
          </div>

          <div className="glass-dark p-6 rounded-xl text-white hover:scale-105 transition-transform">
            <div className="text-sm opacity-80 mb-1 flex items-center gap-2">
              <span>🗺️</span>
              <span>當前路段</span>
            </div>
            <div className="text-2xl font-bold">{currentSegment?.name || '台北市區'}</div>
            <div className="text-xs opacity-60 mt-1">
              {currentSegment?.landmark || '台北車站'}
            </div>
          </div>
        </div>

        {/* Main Display */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Route Progress */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">路線進度</h3>
            <ProgressBar value={progress} color="blue" showPercentage />
            <div className="mt-2 text-sm text-neutral-600 text-center">
              {currentSegment?.landmark}
            </div>
          </div>

          {/* Team Status */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">團隊狀態</h3>
              <div className="text-sm text-neutral-500">
                💡 保持體力在50%以上是成功關鍵
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💪</span>
                  <span className="font-semibold">平均體力</span>
                </div>
                <ProgressBar value={avgStamina} color="auto" />
                <p className="text-xs text-neutral-600 mt-2">
                  {avgStamina > 60 ? '✅ 狀態良好' : avgStamina > 30 ? '⚠️ 體力偏低,注意休息' : '🚨 危險!體力嚴重不足'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🎯</span>
                  <span className="font-semibold">團隊士氣</span>
                </div>
                <ProgressBar value={gameState.team.morale} color="purple" />
                <p className="text-xs text-neutral-600 mt-2">
                  {gameState.team.morale > 70 ? '✨ 士氣高昂' : gameState.team.morale > 40 ? '😐 士氣普通' : '😞 士氣低落'}
                </p>
              </div>
            </div>
          </div>

          {/* Individual Members */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">隊員狀態</h3>
              <div className="text-sm text-neutral-500">
                🚴 = 當前領騎 (消耗體力 1.5倍)
              </div>
            </div>
            <div className="space-y-3">
              {gameState.team.members.map((member, idx) => (
                <div
                  key={member.id}
                  className={`p-4 rounded-lg transition-all ${
                    idx === gameState.team.currentLeader
                      ? 'bg-gradient-sunset text-white shadow-lg scale-105'
                      : 'bg-neutral-100 hover:bg-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold flex items-center gap-2">
                      <span>{member.name}</span>
                      {idx === gameState.team.currentLeader && (
                        <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
                          🚴 領騎中
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium">
                      體力: {Math.round(member.currentStamina)}%
                      {member.currentStamina < 30 && ' ⚠️'}
                    </div>
                  </div>
                  <ProgressBar value={member.currentStamina} color="auto" showPercentage={false} />
                  {member.currentStamina < 30 && (
                    <div className={`text-xs mt-2 ${idx === gameState.team.currentLeader ? 'text-white opacity-90' : 'text-red-600'}`}>
                      ⚠️ 體力嚴重不足,速度大幅下降
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Game Controls - 時間加速 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">⚡ 遊戲速度</h3>
            <div className="text-sm text-neutral-600">
              當前速度: <span className="font-bold text-primary-orange">{timeScale}x</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 5, 10, 50].map(speed => (
              <Button
                key={speed}
                onClick={() => {
                  setTimeScale(speed);
                  toast.success(`遊戲速度調整為 ${speed}x`);
                }}
                className={timeScale === speed ? 'ring-4 ring-primary-orange' : ''}
                variant={timeScale === speed ? 'primary' : 'secondary'}
              >
                {speed}x
              </Button>
            ))}
          </div>
          <div className="mt-3 text-xs text-neutral-500 text-center">
            💡 建議使用 10x 或 50x 速度快速完成遊戲（約 2-5 分鐘）
          </div>
        </div>

        {/* Action Controls - 換領騎 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">🎮 戰術操作</h3>
            <div className="text-sm text-neutral-600">
              主動管理團隊狀態
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleChangeLeader}
              className="bg-gradient-sunset text-white py-4"
              disabled={!gameState || gameState.team.members.length < 2}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">🔄</div>
                <div className="font-bold">換領騎</div>
                <div className="text-xs opacity-90">輪換領騎者避免體力耗盡</div>
              </div>
            </Button>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 flex items-center justify-center">
              <div className="text-center text-sm text-neutral-600">
                <div className="mb-2">💡 策略提示</div>
                <div>當前領騎體力低於 40% 時</div>
                <div>建議換領騎！</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={handlePauseToggle} data-testid="pause-button">
            {isPaused ? '▶️ 繼續' : '⏸️ 暫停'}
          </Button>

          <Button variant="secondary" onClick={handleBackToSetup} data-testid="back-to-setup-button">
            🏠 返回設定
          </Button>

          <Button variant="secondary" onClick={() => setShowHelp(true)} data-testid="help-button">
            📖 遊戲說明
          </Button>

          <Button variant="secondary" onClick={() => setShowTutorial(true)} data-testid="tutorial-button">
            🎓 重看教學
          </Button>
        </div>

        {/* Recent Events */}
        {gameState.events.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold mb-4">最近事件</h3>
            <div className="space-y-2">
              {gameState.events.slice(-5).reverse().map((event, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <span className="text-2xl">{event.icon}</span>
                  <div>
                    <div className="font-semibold">{event.name}</div>
                    <div className="text-sm text-neutral-600">{event.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Help Modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />

      {/* Supply Station Modal */}
      <SupplyStationModal
        isOpen={showSupplyStation}
        stationName={currentSupplyStation?.name || ''}
        onDecision={handleSupplyDecision}
      />
    </div>
  );
}

export default GamePage;
