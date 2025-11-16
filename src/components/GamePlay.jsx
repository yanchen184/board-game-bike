import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * 遊戲進行畫面組件
 * 顯示騎行進度、團隊狀態和策略選項
 */
const GamePlay = ({
  totalDistance = 380,
  teamMembers = [],
  onGameEnd,
  difficulty = 'normal'
}) => {
  // 遊戲狀態
  const [currentDistance, setCurrentDistance] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(25);
  const [teamStamina, setTeamStamina] = useState(100);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // 策略狀態
  const [currentStrategy, setCurrentStrategy] = useState('steady');
  const [weatherCondition, setWeatherCondition] = useState('sunny');
  const [randomEvents, setRandomEvents] = useState([]);

  // 參考
  const gameLoopRef = useRef(null);
  const cyclistRef = useRef(null);
  const speedometerRef = useRef(null);

  // 遊戲主循環
  useEffect(() => {
    if (isPlaying && !isPaused) {
      gameLoopRef.current = setInterval(() => {
        updateGameState();
      }, 100); // 每100ms更新一次

      return () => clearInterval(gameLoopRef.current);
    }
  }, [isPlaying, isPaused, currentDistance, currentSpeed, teamStamina]);

  // 更新遊戲狀態
  const updateGameState = () => {
    // 更新距離
    const distanceIncrement = (currentSpeed / 36); // km/h 轉換為 100ms 的距離
    const newDistance = Math.min(currentDistance + distanceIncrement, totalDistance);
    setCurrentDistance(newDistance);

    // 更新時間
    setElapsedTime(prev => prev + 0.1);

    // 更新體力消耗
    const staminaConsumption = calculateStaminaConsumption();
    const newStamina = Math.max(0, teamStamina - staminaConsumption);
    setTeamStamina(newStamina);

    // 速度調整（基於體力和策略）
    const speedAdjustment = calculateSpeedAdjustment(newStamina);
    setCurrentSpeed(speedAdjustment);

    // 檢查遊戲結束
    if (newDistance >= totalDistance) {
      endGame('completed');
    } else if (newStamina <= 0) {
      endGame('exhausted');
    }

    // 隨機事件觸發
    if (Math.random() < 0.001) {
      triggerRandomEvent();
    }
  };

  // 計算體力消耗
  const calculateStaminaConsumption = () => {
    let consumption = 0.05; // 基礎消耗

    // 策略影響
    switch (currentStrategy) {
      case 'sprint':
        consumption *= 3;
        break;
      case 'fast':
        consumption *= 1.5;
        break;
      case 'steady':
        consumption *= 1;
        break;
      case 'rest':
        consumption *= 0.3;
        break;
    }

    // 天氣影響
    if (weatherCondition === 'headwind') {
      consumption *= 1.5;
    } else if (weatherCondition === 'tailwind') {
      consumption *= 0.8;
    }

    return consumption;
  };

  // 計算速度調整
  const calculateSpeedAdjustment = (stamina) => {
    let baseSpeed = 25;

    // 策略速度
    switch (currentStrategy) {
      case 'sprint':
        baseSpeed = 45;
        break;
      case 'fast':
        baseSpeed = 35;
        break;
      case 'steady':
        baseSpeed = 28;
        break;
      case 'rest':
        baseSpeed = 15;
        break;
    }

    // 體力影響
    if (stamina < 30) {
      baseSpeed *= 0.7;
    } else if (stamina < 50) {
      baseSpeed *= 0.85;
    }

    // 天氣影響
    if (weatherCondition === 'headwind') {
      baseSpeed *= 0.85;
    } else if (weatherCondition === 'tailwind') {
      baseSpeed *= 1.15;
    }

    return Math.max(10, baseSpeed);
  };

  // 觸發隨機事件
  const triggerRandomEvent = () => {
    const events = [
      { type: 'puncture', message: '爆胎了！速度降低', effect: 'speed-10' },
      { type: 'tailwind', message: '順風助力！', effect: 'speed+5' },
      { type: 'energyGel', message: '補給成功！', effect: 'stamina+10' },
      { type: 'cramp', message: '抽筋了！', effect: 'stamina-15' },
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    setRandomEvents(prev => [...prev, event]);

    // 顯示事件通知
    showEventNotification(event);

    // 應用事件效果
    applyEventEffect(event.effect);
  };

  // 顯示事件通知
  const showEventNotification = (event) => {
    gsap.fromTo('.event-notification',
      { y: -100, opacity: 0 },
      {
        y: 20,
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to('.event-notification', {
            y: -100,
            opacity: 0,
            delay: 2,
            duration: 0.5
          });
        }
      }
    );
  };

  // 應用事件效果
  const applyEventEffect = (effect) => {
    if (effect.includes('speed')) {
      const value = parseInt(effect.replace('speed', ''));
      setCurrentSpeed(prev => Math.max(10, prev + value));
    } else if (effect.includes('stamina')) {
      const value = parseInt(effect.replace('stamina', ''));
      setTeamStamina(prev => Math.max(0, Math.min(100, prev + value)));
    }
  };

  // 開始遊戲
  const startGame = () => {
    setIsPlaying(true);
    setIsPaused(false);

    // 開始動畫
    gsap.to(cyclistRef.current, {
      x: '100%',
      duration: 60,
      ease: 'none',
      repeat: -1
    });
  };

  // 暫停/繼續遊戲
  const togglePause = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      gsap.resume(cyclistRef.current);
    } else {
      gsap.pause(cyclistRef.current);
    }
  };

  // 改變策略
  const changeStrategy = (strategy) => {
    setCurrentStrategy(strategy);

    // 策略改變動畫
    gsap.to('.strategy-indicator', {
      scale: 1.2,
      duration: 0.2,
      yoyo: true,
      repeat: 1
    });
  };

  // 使用補給
  const useSupply = () => {
    if (teamStamina < 100) {
      setTeamStamina(prev => Math.min(100, prev + 20));

      // 補給動畫
      gsap.fromTo('.supply-effect',
        { scale: 0, opacity: 1 },
        {
          scale: 2,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out'
        }
      );
    }
  };

  // 結束遊戲
  const endGame = (reason) => {
    setIsPlaying(false);
    clearInterval(gameLoopRef.current);

    const result = {
      distance: currentDistance,
      time: elapsedTime,
      avgSpeed: currentDistance / (elapsedTime / 3600),
      reason,
      events: randomEvents
    };

    if (onGameEnd) {
      onGameEnd(result);
    }
  };

  // 格式化時間
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // 計算進度百分比
  const progressPercentage = (currentDistance / totalDistance) * 100;

  return (
    <div className="game-play min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 事件通知 */}
      <div className="event-notification fixed top-0 left-1/2 transform -translate-x-1/2
                      bg-white rounded-lg shadow-xl p-4 z-50 opacity-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent-yellow flex items-center justify-center">
            ⚡
          </div>
          <p className="text-neutral-900 font-medium">事件觸發</p>
        </div>
      </div>

      {/* 頂部進度條 */}
      <div className="bg-white shadow-medium p-4">
        <div className="max-w-6xl mx-auto">
          {/* 路線進度 */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-500">台北</span>
            <span className="text-lg font-bold text-neutral-900">
              {currentDistance.toFixed(1)} / {totalDistance} km
            </span>
            <span className="text-sm text-neutral-500">高雄</span>
          </div>

          <div className="route-map">
            <div
              className="route-progress"
              style={{ width: `${progressPercentage}%` }}
            />
            <div
              className="route-marker current"
              style={{ left: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 主要遊戲區 */}
      <div className="max-w-6xl mx-auto p-4">
        {/* 騎行視圖 */}
        <div className="cycling-scene rounded-2xl mb-6 overflow-hidden shadow-large">
          {/* 背景層 */}
          <div className="absolute inset-0">
            <div className="h-full bg-gradient-to-b from-sky-200 to-sky-100" />
            {/* 雲朵動畫 */}
            <div className="absolute top-10 animate-float">
              <div className="w-20 h-10 bg-white rounded-full opacity-70" />
            </div>
          </div>

          {/* 騎手動畫 */}
          <div ref={cyclistRef} className="cyclist">
            <svg width="120" height="100" viewBox="0 0 120 100">
              {/* 腳踏車和騎手 SVG */}
              <g className="bike-group">
                {/* 車輪 */}
                <circle cx="30" cy="80" r="15" fill="none" stroke="#333" strokeWidth="2" className="wheel" />
                <circle cx="90" cy="80" r="15" fill="none" stroke="#333" strokeWidth="2" className="wheel" />

                {/* 車架 */}
                <path d="M30 80 L60 60 L90 80 M60 60 L60 40" stroke="#FF6B35" strokeWidth="3" fill="none" />

                {/* 騎手 */}
                <circle cx="60" cy="30" r="8" fill="#FFD93D" />
                <path d="M60 38 L60 55 M60 45 L45 50 M60 45 L75 50" stroke="#333" strokeWidth="2" />
              </g>
            </svg>
          </div>

          {/* 路面 */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-700" />
        </div>

        {/* 狀態面板 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* 速度表 */}
          <div className="card">
            <h3 className="text-sm text-neutral-500 mb-2">當前速度</h3>
            <div className="relative h-32">
              <div ref={speedometerRef} className="text-4xl font-bold text-primary-orange text-center">
                {currentSpeed.toFixed(1)}
                <span className="text-lg text-neutral-500 ml-2">km/h</span>
              </div>

              {/* 速度指示條 */}
              <div className="mt-4 h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-speed transition-all duration-300"
                  style={{ width: `${(currentSpeed / 50) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* 體力條 */}
          <div className="card">
            <h3 className="text-sm text-neutral-500 mb-2">團隊體力</h3>
            <div className="relative">
              <div className="text-4xl font-bold text-primary-green text-center">
                {teamStamina.toFixed(0)}%
              </div>

              <div className="stamina-bar mt-4">
                <div
                  className={`stamina-fill ${
                    teamStamina > 60 ? 'high' :
                    teamStamina > 30 ? 'medium' : 'low'
                  }`}
                  style={{ width: `${teamStamina}%` }}
                />
              </div>

              {/* 補給按鈕 */}
              <button
                onClick={useSupply}
                className="mt-3 w-full py-2 bg-primary-green text-white rounded-lg
                           hover:bg-green-600 transition-colors"
              >
                使用補給 🥤
              </button>

              <div className="supply-effect absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                              w-20 h-20 rounded-full bg-green-400 pointer-events-none" />
            </div>
          </div>

          {/* 時間 */}
          <div className="card">
            <h3 className="text-sm text-neutral-500 mb-2">經過時間</h3>
            <div className="text-4xl font-bold text-primary-blue text-center">
              {formatTime(elapsedTime)}
            </div>

            {/* 天氣狀態 */}
            <div className="mt-4 p-2 bg-neutral-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">天氣</span>
                <span className="text-sm font-medium">
                  {weatherCondition === 'sunny' ? '☀️ 晴天' :
                   weatherCondition === 'headwind' ? '💨 逆風' :
                   weatherCondition === 'tailwind' ? '🍃 順風' : '☁️ 陰天'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 策略控制 */}
        <div className="bg-white rounded-2xl shadow-large p-6">
          <h3 className="text-lg font-bold text-neutral-900 mb-4">
            騎行策略
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => changeStrategy('rest')}
              className={`strategy-indicator py-3 px-4 rounded-lg font-medium transition-all
                ${currentStrategy === 'rest'
                  ? 'bg-blue-500 text-white shadow-glow-blue'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
            >
              🚶 休息
            </button>

            <button
              onClick={() => changeStrategy('steady')}
              className={`strategy-indicator py-3 px-4 rounded-lg font-medium transition-all
                ${currentStrategy === 'steady'
                  ? 'bg-green-500 text-white shadow-glow-blue'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
            >
              🚴 穩定
            </button>

            <button
              onClick={() => changeStrategy('fast')}
              className={`strategy-indicator py-3 px-4 rounded-lg font-medium transition-all
                ${currentStrategy === 'fast'
                  ? 'bg-orange-500 text-white shadow-glow-orange'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
            >
              🏃 加速
            </button>

            <button
              onClick={() => changeStrategy('sprint')}
              className={`strategy-indicator py-3 px-4 rounded-lg font-medium transition-all
                ${currentStrategy === 'sprint'
                  ? 'bg-red-500 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              disabled={teamStamina < 30}
            >
              ⚡ 衝刺
            </button>
          </div>

          {/* 策略說明 */}
          <div className="mt-4 p-3 bg-accent-yellow bg-opacity-10 rounded-lg">
            <p className="text-sm text-neutral-600">
              {currentStrategy === 'rest' && '降低速度恢復體力，適合長途騎行的體力管理'}
              {currentStrategy === 'steady' && '保持穩定配速，平衡速度與體力消耗'}
              {currentStrategy === 'fast' && '提高速度前進，體力消耗增加'}
              {currentStrategy === 'sprint' && '全力衝刺！極速前進但快速消耗體力'}
            </p>
          </div>
        </div>

        {/* 遊戲控制 */}
        <div className="flex justify-center gap-4 mt-6">
          {!isPlaying ? (
            <button
              onClick={startGame}
              className="btn-base btn-primary px-8 py-3 text-lg"
            >
              開始挑戰
            </button>
          ) : (
            <>
              <button
                onClick={togglePause}
                className="btn-base btn-secondary px-6 py-3"
              >
                {isPaused ? '繼續' : '暫停'}
              </button>

              <button
                onClick={() => endGame('quit')}
                className="btn-base bg-neutral-200 text-neutral-700 px-6 py-3
                           hover:bg-neutral-300"
              >
                放棄挑戰
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePlay;