import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';

// 註冊 GSAP 插件
gsap.registerPlugin(Draggable);

/**
 * 隊形編排組件
 * 允許玩家拖曳調整破風隊形
 */
const FormationEditor = ({
  teamMembers = [],
  onFormationChange,
  windDirection = 'north'
}) => {
  const [formation, setFormation] = useState([]);
  const [dragResistance, setDragResistance] = useState(0);
  const [staminaSaving, setStaminaSaving] = useState(0);
  const formationRef = useRef(null);
  const memberRefs = useRef([]);

  // 預設隊形模板
  const formations = {
    single: {
      name: '單線隊形',
      positions: [[0, -120], [0, -40], [0, 40], [0, 120]],
      resistance: 35,
      saving: 25
    },
    double: {
      name: '雙線隊形',
      positions: [[-30, -80], [30, -80], [-30, 0], [30, 0]],
      resistance: 30,
      saving: 20
    },
    diamond: {
      name: '鑽石隊形',
      positions: [[0, -100], [-40, -20], [40, -20], [0, 60]],
      resistance: 40,
      saving: 30
    },
    echelon: {
      name: '梯形隊形',
      positions: [[-60, -80], [-20, -40], [20, 0], [60, 40]],
      resistance: 45,
      saving: 35
    }
  };

  useEffect(() => {
    // 初始化預設隊形
    if (teamMembers.length > 0 && formation.length === 0) {
      const defaultFormation = formations.single;
      const initialFormation = teamMembers.map((member, index) => ({
        ...member,
        position: defaultFormation.positions[index] || [0, index * 80]
      }));
      setFormation(initialFormation);
      calculateEfficiency(initialFormation);
    }
  }, [teamMembers]);

  useEffect(() => {
    // 設置拖曳功能
    formation.forEach((member, index) => {
      if (memberRefs.current[index]) {
        Draggable.create(memberRefs.current[index], {
          type: 'x,y',
          bounds: formationRef.current,
          inertia: true,
          onDrag: function() {
            updateMemberPosition(index, this.x, this.y);
          },
          onDragEnd: function() {
            const newFormation = [...formation];
            newFormation[index].position = [this.x, this.y];
            setFormation(newFormation);
            calculateEfficiency(newFormation);

            // 觸發回調
            if (onFormationChange) {
              onFormationChange(newFormation);
            }

            // 磁吸效果
            snapToGrid(this);
          }
        });
      }
    });

    return () => {
      // 清理拖曳實例
      Draggable.get(memberRefs.current).forEach(draggable => {
        draggable.kill();
      });
    };
  }, [formation]);

  // 計算隊形效率
  const calculateEfficiency = (currentFormation) => {
    if (!currentFormation || currentFormation.length === 0) return;

    let totalResistance = 0;
    let totalSaving = 0;

    currentFormation.forEach((member, index) => {
      if (index > 0) {
        const distance = calculateDistance(
          currentFormation[0].position,
          member.position
        );

        // 根據距離計算風阻降低
        const resistanceReduction = Math.max(0, 50 - distance * 0.2);
        totalResistance += resistanceReduction;

        // 根據位置計算體力節省
        const savingBonus = index === 0 ? 0 : 30 - distance * 0.1;
        totalSaving += Math.max(0, savingBonus);
      }
    });

    const avgResistance = Math.round(totalResistance / Math.max(1, currentFormation.length - 1));
    const avgSaving = Math.round(totalSaving / Math.max(1, currentFormation.length - 1));

    setDragResistance(avgResistance);
    setStaminaSaving(avgSaving);
  };

  // 計算兩點距離
  const calculateDistance = (pos1, pos2) => {
    if (!pos1 || !pos2) return 0;
    const dx = pos1[0] - pos2[0];
    const dy = pos1[1] - pos2[1];
    return Math.sqrt(dx * dx + dy * dy);
  };

  // 更新成員位置
  const updateMemberPosition = (index, x, y) => {
    // 即時視覺反饋
    const element = memberRefs.current[index];
    if (element) {
      // 顯示連線
      updateConnectionLines();
    }
  };

  // 網格磁吸
  const snapToGrid = (draggable) => {
    const gridSize = 20;
    const snappedX = Math.round(draggable.x / gridSize) * gridSize;
    const snappedY = Math.round(draggable.y / gridSize) * gridSize;

    gsap.to(draggable.target, {
      x: snappedX,
      y: snappedY,
      duration: 0.2,
      ease: "power2.inOut"
    });
  };

  // 更新連線
  const updateConnectionLines = () => {
    // SVG 連線邏輯
    // 這裡可以實現成員之間的連線視覺化
  };

  // 應用預設隊形
  const applyFormation = (formationType) => {
    const template = formations[formationType];
    if (!template || teamMembers.length === 0) return;

    const newFormation = teamMembers.map((member, index) => ({
      ...member,
      position: template.positions[index] || [0, index * 80]
    }));

    // 動畫過渡到新隊形
    newFormation.forEach((member, index) => {
      if (memberRefs.current[index]) {
        gsap.to(memberRefs.current[index], {
          x: member.position[0],
          y: member.position[1],
          duration: 0.8,
          ease: "power2.inOut"
        });
      }
    });

    setFormation(newFormation);
    setDragResistance(template.resistance);
    setStaminaSaving(template.saving);

    if (onFormationChange) {
      onFormationChange(newFormation);
    }
  };

  return (
    <div className="formation-editor bg-white rounded-2xl shadow-large p-6">
      {/* 標題和控制 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-neutral-900">
          破風隊形編排
        </h2>

        {/* 預設隊形選擇 */}
        <select
          onChange={(e) => applyFormation(e.target.value)}
          className="px-4 py-2 border-2 border-neutral-300 rounded-lg
                     focus:border-primary-blue focus:outline-none"
        >
          <option value="">選擇預設隊形</option>
          {Object.entries(formations).map(([key, value]) => (
            <option key={key} value={key}>{value.name}</option>
          ))}
        </select>
      </div>

      {/* 隊形編輯區 */}
      <div
        ref={formationRef}
        className="relative w-full h-96 bg-gradient-to-b from-blue-50 to-white
                   rounded-xl border-2 border-dashed border-neutral-300
                   overflow-hidden"
      >
        {/* 風向指示 */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center">
            <div className="text-neutral-500 text-sm mb-2">風向</div>
            <svg
              width="40"
              height="60"
              className="animate-float"
              style={{
                transform: `rotate(${
                  windDirection === 'north' ? 0 :
                  windDirection === 'south' ? 180 :
                  windDirection === 'east' ? 90 : -90
                }deg)`
              }}
            >
              <path
                d="M20 10 L35 40 L20 35 L5 40 Z"
                fill="url(#windGradient)"
                opacity="0.6"
              />
              <defs>
                <linearGradient id="windGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4A90E2" />
                  <stop offset="100%" stopColor="#87CEEB" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* 網格背景 */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.1 }}
        >
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="gray"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* 隊形中心點 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* 成員節點 */}
          {formation.map((member, index) => (
            <div
              key={member.id}
              ref={el => memberRefs.current[index] = el}
              className="absolute cursor-move"
              style={{
                transform: `translate(${member.position[0]}px, ${member.position[1]}px)`
              }}
            >
              {/* 成員圖標 */}
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center
                shadow-large transition-all duration-300 hover:scale-110
                ${index === 0 ? 'bg-gradient-sunset' : 'bg-gradient-sky'}
              `}>
                <span className="text-white font-bold text-lg">
                  {member.name ? member.name[0] : index + 1}
                </span>
              </div>

              {/* 成員標籤 */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2
                              text-xs text-neutral-700 whitespace-nowrap">
                {member.name || `隊員 ${index + 1}`}
              </div>

              {/* 位置指示器 */}
              {index === 0 && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2
                                px-2 py-1 bg-primary-orange text-white text-xs
                                rounded-full whitespace-nowrap">
                  領騎
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 效率指標 */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-neutral-500">風阻降低</div>
              <div className="text-2xl font-bold text-primary-blue">
                {dragResistance}%
              </div>
            </div>
            <svg width="48" height="48" className="text-primary-blue opacity-20">
              <path
                d="M24 4 L44 24 L24 20 L4 24 Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-neutral-500">體力節省</div>
              <div className="text-2xl font-bold text-primary-green">
                {staminaSaving}%
              </div>
            </div>
            <svg width="48" height="48" className="text-primary-green opacity-20">
              <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" />
              <path d="M24 12 L24 24 L34 34" stroke="currentColor" strokeWidth="3" />
            </svg>
          </div>
        </div>
      </div>

      {/* 操作提示 */}
      <div className="mt-4 p-4 bg-accent-yellow bg-opacity-10 rounded-lg">
        <p className="text-sm text-neutral-700">
          💡 <strong>提示：</strong>拖曳隊員調整位置，前方隊員承受更多風阻但為後方隊員節省體力。
          可選擇預設隊形或自訂最適合的陣型。
        </p>
      </div>
    </div>
  );
};

export default FormationEditor;