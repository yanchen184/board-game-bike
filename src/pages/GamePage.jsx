import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Button from '../components/ui/Button';
import AutoGameSimulator from '../components/AutoGameSimulator';
import { setPhase } from '../store/gameSlice';
import { GAME_PHASES } from '../utils/constants';

function GamePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const teamMembers = useSelector(state => state.team.members);

  const [showIntro, setShowIntro] = useState(true);

  // Set game phase to RACING
  useEffect(() => {
    dispatch(setPhase(GAME_PHASES.RACING));
  }, [dispatch]);

  // Check if team is valid
  useEffect(() => {
    if (teamMembers.length < 2) {
      navigate('/setup');
      return;
    }
  }, [teamMembers, navigate]);

  // Handle simulation complete
  const handleSimulationComplete = result => {
    // Navigate to results page with simulation result
    dispatch(setPhase(GAME_PHASES.RESULTS));
    navigate('/results', {
      state: {
        summary: result.summary,
        gameState: result.finalState,
        strategy: result.strategy,
      }
    });
  };

  const handleBackToSetup = () => {
    navigate('/setup');
  };

  // Show intro screen for 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-radial flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6 animate-bounce">🚴</div>
          <h1 className="text-4xl font-bold text-white mb-4">一日北高挑戰</h1>
          <p className="text-xl text-white opacity-90 mb-8">正在準備開始...</p>
          <div className="w-64 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-white animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-radial py-8 px-4" data-testid="game-page">
      <div className="max-w-7xl mx-auto">
        {/* Game Title & Info Banner */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-primary-orange">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                🚴 一日北高挑戰 - 自動演示
              </h2>
              <p className="text-neutral-600">
                根據你的策略設定，正在自動執行比賽...請觀看 30 秒動畫演示
              </p>
            </div>
            <div className="text-center">
              <div className="text-sm text-neutral-500 mb-1">完成目標</div>
              <div className="text-xl font-bold text-primary-orange">
                24小時內抵達高雄
              </div>
            </div>
          </div>
        </div>

        {/* Auto Simulator */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <AutoGameSimulator onSimulationComplete={handleSimulationComplete} />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button variant="secondary" onClick={handleBackToSetup} data-testid="back-to-setup-button">
            🏠 返回設定
          </Button>
        </div>

        {/* Info Panel */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-3 text-neutral-900">💡 觀看提示</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-700">
            <div className="flex items-start gap-2">
              <span className="text-lg">⚡</span>
              <div>
                <div className="font-semibold">自動執行</div>
                <div>系統根據你的策略自動處理所有事件</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🎬</span>
              <div>
                <div className="font-semibold">30秒演示</div>
                <div>快速呈現完整比賽過程</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">📊</span>
              <div>
                <div className="font-semibold">即時數據</div>
                <div>觀察距離、時間、隊員體力變化</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🏆</span>
              <div>
                <div className="font-semibold">查看結果</div>
                <div>演示結束後自動跳轉至結果頁面</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GamePage;
