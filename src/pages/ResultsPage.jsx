import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { gsap } from 'gsap';
import { Trophy, TrendingUp } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { calculateFinalScore } from '../services/calculations';
import { clearGameState, addToLeaderboard } from '../services/storage';
import { resetGame } from '../store/gameSlice';
import { resetTeam } from '../store/teamSlice';
import { resetBike } from '../store/bikeSlice';
import firebaseLeaderboard from '../services/firebase/leaderboard.service';

function ResultsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { summary, gameState } = location.state || {};

  const [globalRank, setGlobalRank] = useState(null);
  const [showRankAnimation, setShowRankAnimation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const scoreRef = useRef(null);
  const cardsRef = useRef(null);

  // Submit to global leaderboard function using Firebase
  const submitToGlobalLeaderboard = async (scoreData, gameData) => {
    try {
      setSubmitting(true);

      const result = await firebaseLeaderboard.submitScore({
        playerName: '玩家', // Can be customized later
        totalScore: scoreData.totalScore,
        completionTime: gameData.completionTime,
        teamFinished: gameData.teamFinished,
        totalTeamSize: gameData.totalTeamSize,
        averageFatigue: gameData.averageFatigue,
        budgetUsed: gameData.budgetUsed,
        budgetLimit: 5000,
        eventsHandled: gameData.eventsHandled || 0,
        mechanicalFailures: gameData.mechanicalFailures || 0,
        weatherChallenges: gameData.weatherChallenges || 0,
        teamComposition: gameData.team?.members?.map(m => m.type) || [],
        route: '一日北高挑戰',
      });

      if (result && result.success) {
        setGlobalRank(result.rank);
        setShowRankAnimation(true);
        console.log('Score submitted successfully! Rank:', result.rank);
      }
    } catch (error) {
      console.error('Failed to submit score to Firebase:', error);
      // Don't block UI if submission fails
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!summary) {
      navigate('/');
      return;
    }

    // Clear saved game state since race is complete
    clearGameState();

    // Save score to leaderboard (local and global)
    if (summary.completed) {
      const scoreData = calculateFinalScore({
        completionTime: summary.completionTime,
        teamFinished: summary.teamFinished,
        totalTeamSize: summary.totalTeamSize,
        averageFatigue: summary.averageFatigue,
        budgetUsed: gameState?.bike?.totalCost + gameState?.team?.members.reduce((sum, m) => sum + m.cost, 0) || 0,
        budgetLimit: 5000,
        eventsHandled: summary.stats?.eventsHandled || 0,
        mechanicalFailures: summary.stats?.mechanicalFailures || 0,
        weatherChallenges: summary.stats?.weatherChallenges || 0,
      });

      // Save to local storage
      addToLeaderboard({
        totalScore: scoreData.totalScore,
        completionTime: summary.completionTime,
        teamFinished: summary.teamFinished,
        totalTeamSize: summary.totalTeamSize,
      });

      // Submit to global leaderboard with Firebase
      submitToGlobalLeaderboard(scoreData, {
        completionTime: summary.completionTime,
        teamFinished: summary.teamFinished,
        totalTeamSize: summary.totalTeamSize,
        averageFatigue: summary.averageFatigue,
        budgetUsed: gameState?.bike?.totalCost + gameState?.team?.members.reduce((sum, m) => sum + m.cost, 0) || 0,
        eventsHandled: summary.stats?.eventsHandled || 0,
        mechanicalFailures: summary.stats?.mechanicalFailures || 0,
        weatherChallenges: summary.stats?.weatherChallenges || 0,
        team: gameState?.team,
      });
    }

    // Animate score counting up
    const tl = gsap.timeline();
    tl.fromTo(
      scoreRef.current,
      { scale: 0, rotation: -180 },
      { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(2)' }
    ).fromTo(
      cardsRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
      '-=0.3'
    );

    return () => tl.kill();
  }, [summary, navigate, gameState]);

  if (!summary) {
    return null;
  }

  // Calculate score
  const scoreData = calculateFinalScore({
    completionTime: summary.completionTime,
    teamFinished: summary.teamFinished,
    totalTeamSize: summary.totalTeamSize,
    averageFatigue: summary.averageFatigue,
    budgetUsed: gameState?.bike?.totalCost + gameState?.team?.members.reduce((sum, m) => sum + m.cost, 0) || 0,
    budgetLimit: 5000,
    eventsHandled: summary.stats?.eventsHandled || 0,
    mechanicalFailures: summary.stats?.mechanicalFailures || 0,
    weatherChallenges: summary.stats?.weatherChallenges || 0,
  });

  // Format time
  const formatTime = seconds => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  // Determine rank
  const getRank = score => {
    if (score >= 2000) return { rank: 'S', color: 'text-accent-purple', desc: '傳奇表現！' };
    if (score >= 1500) return { rank: 'A', color: 'text-primary-green', desc: '優秀！' };
    if (score >= 1000) return { rank: 'B', color: 'text-primary-blue', desc: '良好' };
    if (score >= 500) return { rank: 'C', color: 'text-primary-orange', desc: '合格' };
    return { rank: 'D', color: 'text-accent-red', desc: '需要改進' };
  };

  const rankInfo = getRank(scoreData.totalScore);

  return (
    <div className="min-h-screen bg-gradient-sky py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Result Status */}
        <div className="text-center mb-12">
          {summary.completed && !summary.failed ? (
            <>
              <h1 className="text-6xl font-bold text-white mb-4">🎉 挑戰完成！</h1>
              <p className="text-2xl text-white opacity-90">恭喜完成一日北高挑戰！</p>
            </>
          ) : (
            <>
              <h1 className="text-6xl font-bold text-white mb-4">💪 未完成挑戰</h1>
              <p className="text-2xl text-white opacity-90">雖然未完成，但這也是寶貴經驗！</p>
            </>
          )}
        </div>

        {/* Final Score */}
        <div ref={scoreRef} className="bg-white rounded-3xl p-12 shadow-2xl mb-8 text-center relative">
          <div className="text-lg text-neutral-600 mb-2">最終分數</div>
          <div className={`text-8xl font-bold mb-4 ${rankInfo.color}`}>
            {scoreData.totalScore}
          </div>
          <div className={`text-4xl font-bold mb-2 ${rankInfo.color}`}>
            評級: {rankInfo.rank}
          </div>
          <div className="text-xl text-neutral-600">{rankInfo.desc}</div>

          {/* Global Rank Display */}
          {globalRank && showRankAnimation && (
            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl">
              <div className="flex items-center justify-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-600" />
                <div className="text-2xl font-bold text-gray-800">
                  全球排名：第 <span className="text-orange-600 text-3xl">{globalRank}</span> 名
                </div>
                <TrendingUp className="w-8 h-8 text-green-500 animate-bounce" />
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <h3 className="text-lg font-semibold mb-3 text-neutral-700">完成時間</h3>
            <div className="text-3xl font-bold text-primary-blue">
              {formatTime(summary.completionTime)}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-3 text-neutral-700">完成距離</h3>
            <div className="text-3xl font-bold text-primary-green">
              {Math.round(summary.finalDistance)} km
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-3 text-neutral-700">團隊狀況</h3>
            <div className="text-3xl font-bold text-primary-orange">
              {summary.teamFinished} / {summary.totalTeamSize} 人
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-3 text-neutral-700">平均效率</h3>
            <div className="text-3xl font-bold text-accent-purple">
              {Math.round((1 - summary.averageFatigue) * 100)}%
            </div>
          </Card>
        </div>

        {/* Score Breakdown */}
        <Card className="mb-8">
          <h3 className="text-2xl font-bold mb-6">分數明細</h3>
          <div className="space-y-3">
            {Object.entries(scoreData.breakdown).map(([key, value]) => {
              const labels = {
                timeBonus: '⏱️ 時間獎勵',
                teamBonus: '👥 團隊獎勵',
                efficiencyBonus: '⚡ 效率獎勵',
                budgetBonus: '💰 預算獎勵',
                eventBonus: '🎯 事件處理',
                specialBonus: '✨ 特殊獎勵',
                failurePenalty: '❌ 故障扣分',
              };

              return (
                <div key={key} className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="font-medium">{labels[key]}</span>
                  <span className={`font-bold ${value < 0 ? 'text-accent-red' : 'text-primary-green'}`}>
                    {value > 0 && '+'}{Math.round(value)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => {
              dispatch(resetGame());
              dispatch(resetTeam());
              dispatch(resetBike());
              navigate('/setup');
            }}
          >
            🔄 再玩一次
          </Button>

          <button
            onClick={() => navigate('/leaderboard')}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500
                     text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl
                     transform hover:scale-105 transition-all duration-300
                     flex items-center justify-center gap-2"
            disabled={submitting}
          >
            <Trophy className="w-6 h-6" />
            查看完整排行榜
          </button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => {
              dispatch(resetGame());
              dispatch(resetTeam());
              dispatch(resetBike());
              navigate('/');
            }}
          >
            🏠 返回主選單
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;
