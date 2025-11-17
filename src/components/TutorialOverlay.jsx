import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { gsap } from 'gsap';
import Button from './ui/Button';

/**
 * 新手教學覆蓋層組件
 * 分步驟引導用戶了解遊戲玩法
 */
const TutorialOverlay = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  const tutorialSteps = [
    {
      title: '歡迎來到一日北高挑戰! 🚴',
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            這是一款策略模擬遊戲,你的目標是帶領車隊在 <strong className="text-primary-orange">24小時內</strong> 完成從台北到高雄的 <strong className="text-primary-blue">380公里</strong> 挑戰!
          </p>
          <div className="bg-accent-yellow bg-opacity-20 p-4 rounded-lg border-2 border-accent-yellow">
            <p className="font-semibold text-neutral-900">
              💡 這不是一個需要快速反應的遊戲,而是考驗你的<strong>策略規劃能力</strong>!
            </p>
          </div>
        </div>
      ),
      highlight: null,
    },
    {
      title: '遊戲會自動進行 ⚙️',
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            比賽開始後,車隊會<strong>自動前進</strong>,你不需要控制移動。
          </p>
          <p className="text-lg">
            你的任務是<strong>監控團隊狀態</strong>,並在關鍵時刻做出正確決策!
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-primary-blue">
            <p className="font-semibold text-primary-blue">
              🎯 重點: 觀察數據,適時調整策略,確保團隊順利完成挑戰!
            </p>
          </div>
        </div>
      ),
      highlight: null,
    },
    {
      title: '監控關鍵數據 📊',
      content: (
        <div className="space-y-4">
          <p className="text-lg mb-4">螢幕上的四個數據卡片顯示:</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-100 p-3 rounded-lg">
              <div className="font-bold text-primary-orange mb-1">距離 📍</div>
              <p className="text-sm">目前騎了多遠 / 總距離</p>
            </div>
            <div className="bg-neutral-100 p-3 rounded-lg">
              <div className="font-bold text-primary-blue mb-1">時間 ⏱️</div>
              <p className="text-sm">已經過的時間 (限時24小時)</p>
            </div>
            <div className="bg-neutral-100 p-3 rounded-lg">
              <div className="font-bold text-primary-green mb-1">速度 💨</div>
              <p className="text-sm">當前騎行速度 (km/h)</p>
            </div>
            <div className="bg-neutral-100 p-3 rounded-lg">
              <div className="font-bold text-accent-purple mb-1">路段 🗺️</div>
              <p className="text-sm">目前所在位置</p>
            </div>
          </div>
        </div>
      ),
      highlight: '.glass-dark',
    },
    {
      title: '團隊體力管理 💪',
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <strong className="text-red-500">體力</strong>是最重要的資源!
          </p>
          <ul className="space-y-2 text-lg">
            <li className="flex items-start gap-2">
              <span className="text-2xl">⚠️</span>
              <span>體力低於30%時,速度會大幅下降</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-2xl">❌</span>
              <span>體力歸零時,該隊員會退出比賽</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-2xl">🚴</span>
              <span>領騎者(標示🚴)會消耗更多體力</span>
            </li>
          </ul>
          <div className="bg-green-50 p-4 rounded-lg border-2 border-primary-green">
            <p className="font-semibold text-primary-green">
              💡 記住: 保持團隊體力在50%以上是成功的關鍵!
            </p>
          </div>
        </div>
      ),
      highlight: null,
    },
    {
      title: '注意隨機事件 🎲',
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            途中會遇到各種<strong>隨機事件</strong>:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
              <span className="text-2xl">☀️</span>
              <div>
                <div className="font-semibold">好天氣</div>
                <div className="text-sm text-neutral-600">順風會提升速度,逆風會降低速度</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-yellow-50 p-3 rounded-lg">
              <span className="text-2xl">🔧</span>
              <div>
                <div className="font-semibold">機械問題</div>
                <div className="text-sm text-neutral-600">爆胎、變速故障等會影響進度</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-green-50 p-3 rounded-lg">
              <span className="text-2xl">🥤</span>
              <div>
                <div className="font-semibold">補給站</div>
                <div className="text-sm text-neutral-600">停靠補給站可以恢復體力</div>
              </div>
            </div>
          </div>
          <p className="text-sm text-neutral-600 italic">
            * 事件會在畫面下方顯示,請留意!
          </p>
        </div>
      ),
      highlight: null,
    },
    {
      title: '遊戲控制 🎮',
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            遊戲過程中你可以:
          </p>
          <div className="space-y-3">
            <div className="bg-neutral-100 p-4 rounded-lg">
              <div className="font-bold mb-2 flex items-center gap-2">
                <span>⏸️</span>
                <span>暫停/繼續</span>
              </div>
              <p className="text-sm text-neutral-600">
                隨時暫停遊戲查看狀態或思考策略
              </p>
            </div>
            <div className="bg-neutral-100 p-4 rounded-lg">
              <div className="font-bold mb-2 flex items-center gap-2">
                <span>🏠</span>
                <span>返回設定</span>
              </div>
              <p className="text-sm text-neutral-600">
                如果想重新配置團隊,可以返回設置頁面
              </p>
            </div>
            <div className="bg-neutral-100 p-4 rounded-lg">
              <div className="font-bold mb-2 flex items-center gap-2">
                <span>📖</span>
                <span>遊戲說明</span>
              </div>
              <p className="text-sm text-neutral-600">
                隨時點擊幫助按鈕查看詳細說明
              </p>
            </div>
          </div>
        </div>
      ),
      highlight: null,
    },
    {
      title: '準備好了嗎? 🎯',
      content: (
        <div className="space-y-6 text-center">
          <p className="text-xl">
            現在你已經了解基本玩法了!
          </p>
          <div className="bg-gradient-sunset text-white p-6 rounded-xl">
            <h3 className="text-2xl font-bold mb-3">成功秘訣 🏆</h3>
            <ul className="text-left space-y-2">
              <li className="flex items-start gap-2">
                <span>1️⃣</span>
                <span>時刻關注團隊體力,不要讓體力降太低</span>
              </li>
              <li className="flex items-start gap-2">
                <span>2️⃣</span>
                <span>注意隨機事件,適時應對</span>
              </li>
              <li className="flex items-start gap-2">
                <span>3️⃣</span>
                <span>保持耐心,這是一場長途挑戰!</span>
              </li>
            </ul>
          </div>
          <p className="text-lg text-neutral-600">
            點擊"開始挑戰"按鈕,祝你好運! 🚴💨
          </p>
        </div>
      ),
      highlight: null,
    },
  ];

  useEffect(() => {
    if (isOpen) {
      // Entrance animation
      const tl = gsap.timeline();
      tl.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      ).fromTo(
        contentRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' },
        '-=0.2'
      );

      return () => tl.kill();
    }
  }, [isOpen, currentStep]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      // Animate out current content
      gsap.to(contentRef.current, {
        opacity: 0,
        x: -20,
        duration: 0.2,
        onComplete: () => {
          setCurrentStep(currentStep + 1);
          // Animate in new content
          gsap.fromTo(
            contentRef.current,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.3 }
          );
        },
      });
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      gsap.to(contentRef.current, {
        opacity: 0,
        x: 20,
        duration: 0.2,
        onComplete: () => {
          setCurrentStep(currentStep - 1);
          gsap.fromTo(
            contentRef.current,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.3 }
          );
        },
      });
    }
  };

  const handleSkip = () => {
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        onClose();
      },
    });
  };

  const handleComplete = () => {
    gsap.to(overlayRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      onComplete: () => {
        if (onComplete) onComplete();
        onClose();
      },
    });
  };

  if (!isOpen) return null;

  const currentStepData = tutorialSteps[currentStep];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70"
      style={{ opacity: 0 }}
    >
      <div
        ref={contentRef}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-sunset text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
            <button
              onClick={handleSkip}
              className="text-white hover:text-neutral-200 transition-colors"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            {tutorialSteps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  idx === currentStep
                    ? 'bg-white'
                    : idx < currentStep
                    ? 'bg-white bg-opacity-50'
                    : 'bg-white bg-opacity-20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">{currentStepData.content}</div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-neutral-50 p-6 rounded-b-2xl border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              {currentStep + 1} / {tutorialSteps.length}
            </div>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button variant="secondary" onClick={handlePrev}>
                  ← 上一步
                </Button>
              )}

              <Button onClick={handleNext}>
                {currentStep < tutorialSteps.length - 1 ? '下一步 →' : '開始挑戰! 🚀'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

TutorialOverlay.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onComplete: PropTypes.func,
};

export default TutorialOverlay;
