import React, { useState } from 'react';
import { gsap } from 'gsap';

/**
 * 角色卡片組件
 * 顯示角色資訊、屬性和選擇狀態
 */
const CharacterCard = ({
  character,
  isSelected,
  onSelect,
  disabled = false
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = React.useRef(null);

  // 卡片翻轉動畫
  const handleFlip = () => {
    if (!disabled) {
      setIsFlipped(!isFlipped);
      gsap.to(cardRef.current, {
        rotationY: isFlipped ? 0 : 180,
        duration: 0.6,
        ease: "power2.inOut"
      });
    }
  };

  // 選擇角色
  const handleSelect = (e) => {
    e.stopPropagation();
    if (!disabled && onSelect) {
      onSelect(character.id);

      // 選擇動畫
      gsap.fromTo(cardRef.current,
        { scale: 1 },
        {
          scale: 1.1,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        }
      );
    }
  };

  // 屬性雷達圖數據
  const attributes = [
    { name: '速度', value: character.speed, max: 100 },
    { name: '耐力', value: character.stamina, max: 100 },
    { name: '爬坡', value: character.climbing, max: 100 },
    { name: '衝刺', value: character.sprint, max: 100 },
    { name: '恢復', value: character.recovery, max: 100 },
  ];

  return (
    <div
      ref={cardRef}
      className={`
        character-card relative w-full max-w-xs mx-auto
        ${isSelected ? 'ring-4 ring-primary-orange ring-opacity-50' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={handleFlip}
    >
      {/* 卡片正面 */}
      <div className={`
        card-front bg-white rounded-2xl p-6
        shadow-large hover:shadow-xl transition-all duration-300
        ${isFlipped ? 'hidden' : 'block'}
      `}>
        {/* 角色頭像 */}
        <div className="relative mb-4">
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-sky
                          flex items-center justify-center text-white text-4xl">
            {character.avatar || character.name[0]}
          </div>

          {/* 角色類型標籤 */}
          <span className={`
            absolute top-0 right-0 px-3 py-1 rounded-full text-xs font-semibold
            ${character.type === 'breaker' ? 'bg-primary-orange text-white' : ''}
            ${character.type === 'climber' ? 'bg-primary-green text-white' : ''}
            ${character.type === 'sprinter' ? 'bg-accent-purple text-white' : ''}
            ${character.type === 'allrounder' ? 'bg-primary-blue text-white' : ''}
          `}>
            {character.typeLabel}
          </span>
        </div>

        {/* 角色資訊 */}
        <h3 className="text-xl font-bold text-center mb-2 text-neutral-900">
          {character.name}
        </h3>
        <p className="text-sm text-neutral-500 text-center mb-4">
          {character.description}
        </p>

        {/* 主要屬性顯示 */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="text-center p-2 bg-neutral-50 rounded-lg">
            <div className="text-2xl font-bold text-primary-orange">
              {character.speed}
            </div>
            <div className="text-xs text-neutral-500">速度</div>
          </div>
          <div className="text-center p-2 bg-neutral-50 rounded-lg">
            <div className="text-2xl font-bold text-primary-blue">
              {character.stamina}
            </div>
            <div className="text-xs text-neutral-500">耐力</div>
          </div>
        </div>

        {/* 選擇按鈕 */}
        <button
          onClick={handleSelect}
          className={`
            w-full py-3 rounded-lg font-semibold transition-all duration-300
            ${isSelected
              ? 'bg-primary-green text-white'
              : 'bg-gradient-sunset text-white hover:shadow-glow-orange'
            }
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          disabled={disabled}
        >
          {isSelected ? '已選擇' : '選擇角色'}
        </button>
      </div>

      {/* 卡片背面 - 詳細屬性 */}
      <div className={`
        card-back bg-white rounded-2xl p-6
        shadow-large transition-all duration-300
        ${!isFlipped ? 'hidden' : 'block'}
      `}>
        <h4 className="text-lg font-bold mb-4 text-neutral-900">
          能力詳情
        </h4>

        {/* 屬性條 */}
        <div className="space-y-3 mb-6">
          {attributes.map((attr) => (
            <div key={attr.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-700">{attr.name}</span>
                <span className="font-semibold text-neutral-900">
                  {attr.value}
                </span>
              </div>
              <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-speed rounded-full transition-all duration-500"
                  style={{ width: `${(attr.value / attr.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 特殊技能 */}
        <div className="border-t pt-4">
          <h5 className="text-sm font-semibold mb-2 text-neutral-700">
            特殊技能
          </h5>
          <div className="flex flex-wrap gap-2">
            {character.skills?.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-accent-yellow bg-opacity-20
                           text-xs rounded-full text-neutral-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* 返回按鈕 */}
        <button
          onClick={handleFlip}
          className="w-full mt-4 py-2 border-2 border-primary-blue
                     text-primary-blue rounded-lg hover:bg-primary-blue
                     hover:text-white transition-all duration-300"
        >
          返回
        </button>
      </div>

      {/* 選中標記 */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-green
                        rounded-full flex items-center justify-center
                        text-white shadow-medium animate-scale-up">
          ✓
        </div>
      )}
    </div>
  );
};

export default CharacterCard;