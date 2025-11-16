import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { gsap } from 'gsap';
import Button from '../components/ui/Button';
import HelpModal from '../components/HelpModal';
import { resetGame } from '../store/gameSlice';
import { resetTeam } from '../store/teamSlice';
import { resetBike } from '../store/bikeSlice';
import { loadGameState, clearGameState } from '../services/storage';
import { GAME_PHASES } from '../utils/constants';

function StartPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // Check for saved game
    const savedState = loadGameState();
    if (savedState && savedState.game) {
      // Only show continue if game is in racing or setup phase
      const canContinue =
        savedState.game.phase === GAME_PHASES.RACING ||
        savedState.game.phase === GAME_PHASES.SETUP;
      setHasSavedGame(canContinue);
    }

    // Entrance animations
    const tl = gsap.timeline();

    tl.fromTo(
      titleRef.current,
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' }
    )
      .fromTo(
        subtitleRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.4'
      )
      .fromTo(
        buttonsRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5 },
        '-=0.3'
      );

    return () => tl.kill();
  }, []);

  const handleStart = () => {
    // Clear any saved game
    clearGameState();

    // Reset all game state
    dispatch(resetGame());
    dispatch(resetTeam());
    dispatch(resetBike());

    // Navigate to setup
    navigate('/setup');
  };

  const handleContinue = () => {
    const savedState = loadGameState();
    if (savedState && savedState.game) {
      // Navigate based on saved phase
      if (savedState.game.phase === GAME_PHASES.RACING) {
        navigate('/game');
      } else if (savedState.game.phase === GAME_PHASES.SETUP) {
        navigate('/setup');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-radial flex items-center justify-center p-4">
      <div className="text-center max-w-4xl">
        {/* Title */}
        <h1
          ref={titleRef}
          className="text-6xl md:text-8xl font-bold text-white mb-6 text-gradient"
        >
          一日北高挑戰
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-xl md:text-2xl text-white mb-4 opacity-90"
        >
          Taipei to Kaohsiung Challenge
        </p>

        <p className="text-lg text-white mb-12 opacity-80 max-w-2xl mx-auto">
          380公里的長途挑戰，考驗你的策略規劃與團隊協作能力
        </p>

        {/* Buttons */}
        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center">
          {hasSavedGame && (
            <Button size="lg" variant="primary" onClick={handleContinue}>
              ▶️ 繼續遊戲
            </Button>
          )}

          <Button size="lg" onClick={handleStart}>
            🚴 {hasSavedGame ? '新遊戲' : '開始挑戰'}
          </Button>

          <Button size="lg" variant="secondary" onClick={() => setShowHelp(true)}>
            📖 遊戲說明
          </Button>
        </div>

        {/* Help Modal */}
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

        {/* Game Stats Preview */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
          <div className="glass p-6 rounded-xl">
            <div className="text-4xl mb-2">380</div>
            <div className="text-sm opacity-80">公里路程</div>
          </div>
          <div className="glass p-6 rounded-xl">
            <div className="text-4xl mb-2">24</div>
            <div className="text-sm opacity-80">小時限制</div>
          </div>
          <div className="glass p-6 rounded-xl">
            <div className="text-4xl mb-2">4</div>
            <div className="text-sm opacity-80">種角色類型</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartPage;
