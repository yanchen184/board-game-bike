import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import Loading from '../components/ui/Loading';
import { useGameLoop } from '../hooks/useGameLoop';
import { initializeRaceState, updateRaceState, getRaceSummary } from '../services/gameEngine';
import { getSegmentAtDistance } from '../data/routes';

function GamePage() {
  const navigate = useNavigate();
  const teamMembers = useSelector(state => state.team.members);
  const teamFormation = useSelector(state => state.team.formation);
  const bikeConfig = useSelector(state => state.bike);

  const [gameState, setGameState] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

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
  }, []);

  // Game loop
  const handleGameTick = useCallback(
    deltaTime => {
      if (!gameState) return;

      const newState = updateRaceState(gameState, deltaTime);
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
    [gameState, navigate]
  );

  useGameLoop(handleGameTick, isPaused || !gameState);

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

  if (!gameState) {
    return <Loading fullscreen message="初始化比賽..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-radial py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-dark p-6 rounded-xl text-white">
            <div className="text-sm opacity-80 mb-1">距離</div>
            <div className="text-3xl font-bold">
              {Math.round(gameState.distance)} / {gameState.totalDistance} km
            </div>
          </div>

          <div className="glass-dark p-6 rounded-xl text-white">
            <div className="text-sm opacity-80 mb-1">時間</div>
            <div className="text-3xl font-bold">{formatTime(gameState.timeElapsed)}</div>
          </div>

          <div className="glass-dark p-6 rounded-xl text-white">
            <div className="text-sm opacity-80 mb-1">速度</div>
            <div className="text-3xl font-bold">{Math.round(gameState.speed)} km/h</div>
          </div>

          <div className="glass-dark p-6 rounded-xl text-white">
            <div className="text-sm opacity-80 mb-1">當前路段</div>
            <div className="text-2xl font-bold">{currentSegment?.name || '未知'}</div>
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
            <h3 className="text-xl font-bold mb-4">團隊狀態</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <ProgressBar value={avgStamina} label="平均體力" color="auto" />
              </div>
              <div>
                <ProgressBar value={gameState.team.morale} label="士氣" color="purple" />
              </div>
            </div>
          </div>

          {/* Individual Members */}
          <div>
            <h3 className="text-xl font-bold mb-4">隊員狀態</h3>
            <div className="space-y-3">
              {gameState.team.members.map((member, idx) => (
                <div
                  key={member.id}
                  className={`p-4 rounded-lg ${
                    idx === gameState.team.currentLeader
                      ? 'bg-gradient-sunset text-white'
                      : 'bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">
                      {member.name}
                      {idx === gameState.team.currentLeader && ' 🚴 (領騎)'}
                    </div>
                    <div className="text-sm">
                      體力: {Math.round(member.currentStamina)}%
                    </div>
                  </div>
                  <ProgressBar value={member.currentStamina} color="auto" showPercentage={false} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button onClick={handlePauseToggle}>{isPaused ? '▶️ 繼續' : '⏸️ 暫停'}</Button>

          <Button variant="secondary" onClick={handleBackToSetup}>
            🏠 返回設定
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
    </div>
  );
}

export default GamePage;
