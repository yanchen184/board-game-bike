# 🏆 榮譽榜 (Leaderboard) UI/UX 設計規格書

## 目錄
1. [設計總覽](#設計總覽)
2. [榮譽榜入口設計](#榮譽榜入口設計)
3. [榮譽榜主頁面設計](#榮譽榜主頁面設計)
4. [排行項目設計](#排行項目設計)
5. [動畫效果系統](#動畫效果系統)
6. [響應式設計](#響應式設計)
7. [空狀態與加載設計](#空狀態與加載設計)
8. [組件結構](#組件結構)
9. [實作程式碼範例](#實作程式碼範例)

---

## 設計總覽

### 設計理念
- **競技激情**：營造競爭氛圍，激發挑戰慾望
- **成就感**：突出個人最佳成績，提供成就認同
- **社交元素**：支援好友比較、團隊排名
- **視覺層次**：清晰的排名視覺化，快速識別重點資訊

### 設計目標
1. 提供多維度排行榜（全球、地區、好友、今日）
2. 展示豐富的統計數據（完成時間、團隊配置、路線選擇）
3. 創造視覺吸引力（動態進入、排名變化動畫）
4. 優化使用者體驗（快速載入、流暢切換）

---

## 榮譽榜入口設計

### 1. 主選單入口
```
位置：StartPage 主選單
----------------------------------------
[開始遊戲] - 主要CTA按鈕
[教學模式] - 次要按鈕
[🏆 排行榜] - 次要按鈕（加入獎盃圖標）
           ↓
    [脈動光環效果]
    [新紀錄標籤提示]
----------------------------------------
```

**Tailwind CSS 類別**：
```jsx
<button className="
  relative
  px-8 py-4
  bg-gradient-to-r from-yellow-400 to-orange-500
  text-white font-bold text-lg
  rounded-lg
  shadow-lg hover:shadow-xl
  transform hover:scale-105
  transition-all duration-300
  overflow-hidden
">
  <span className="relative z-10 flex items-center gap-2">
    <Trophy className="w-6 h-6" />
    排行榜
  </span>

  {/* 脈動光環 */}
  <span className="
    absolute inset-0
    bg-gradient-to-r from-yellow-300 to-orange-400
    animate-pulse
    opacity-50
  "/>

  {/* 新紀錄提示標籤 */}
  {hasNewRecord && (
    <span className="
      absolute -top-2 -right-2
      bg-red-500 text-white text-xs
      px-2 py-1 rounded-full
      animate-bounce
    ">
      NEW!
    </span>
  )}
</button>
```

### 2. 遊戲內快速入口
```
位置：GamePage 頂部狀態列
----------------------------------------
[暫停] [排行榜圖標] [設定]
         ↓
   [迷你排行榜預覽]
   顯示當前排名位置
----------------------------------------
```

### 3. 結果頁面入口
```
位置：ResultsPage 成績展示後
----------------------------------------
你的排名：全球第 127 名 ↑23
[查看完整排行榜] - 呼叫行動按鈕
----------------------------------------
```

---

## 榮譽榜主頁面設計

### 整體布局
```
┌─────────────────────────────────────────────┐
│  🏆 騎 行 榮 譽 榜          [返回] [篩選]    │
├─────────────────────────────────────────────┤
│                                             │
│  [全球榜] [今日榜] [本週榜] [好友榜] [個人]  │
│  ─────────────────────────────────────────  │
│                                             │
│  當前排名：#127 | 最佳排名：#45             │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  🥇 1. WindRider         10:23:45  ↑2      │
│     團隊：破風手x2, 爬坡手, 衝刺手          │
│     路線：山線挑戰                          │
│                                             │
│  🥈 2. TeamTaiwan        10:45:12  →       │
│     團隊：全能型x2, 耐力型x2               │
│     路線：海線速攻                          │
│                                             │
│  🥉 3. CyclingMaster     11:02:33  ↓1      │
│     團隊：破風手, 爬坡手x2, 輔助型          │
│     路線：平衡路線                          │
│                                             │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│                                             │
│  127. You               13:45:30  ↑23 NEW!  │
│     團隊：你的團隊配置                      │
│     路線：你的路線選擇                      │
│                                             │
│  [載入更多...]                              │
│                                             │
└─────────────────────────────────────────────┘
```

### 分頁標籤設計

**Tailwind CSS 實作**：
```jsx
<div className="flex gap-2 p-4 bg-gray-50 rounded-t-xl">
  {['全球榜', '今日榜', '本週榜', '好友榜', '個人紀錄'].map((tab) => (
    <button
      key={tab}
      className={`
        px-6 py-3 rounded-lg font-semibold
        transition-all duration-300
        ${activeTab === tab
          ? 'bg-gradient-to-r from-orange-500 to-yellow-400 text-white shadow-lg transform scale-105'
          : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-orange-500'
        }
      `}
    >
      {tab}
      {tab === '今日榜' && (
        <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
          Live
        </span>
      )}
    </button>
  ))}
</div>
```

---

## 排行項目設計

### 排名卡片組件
```jsx
const LeaderboardItem = ({ rank, player, isCurrentUser, rankChange }) => (
  <div className={`
    relative p-6 mb-4 bg-white rounded-xl shadow-lg
    transform transition-all duration-500 hover:scale-102 hover:shadow-xl
    ${isCurrentUser ? 'ring-4 ring-orange-400 bg-gradient-to-r from-orange-50 to-yellow-50' : ''}
  `}>
    {/* 排名徽章 */}
    <div className="absolute -left-4 top-1/2 -translate-y-1/2">
      <RankBadge rank={rank} />
    </div>

    {/* 主要內容 */}
    <div className="grid grid-cols-12 gap-4 items-center">
      {/* 排名 */}
      <div className="col-span-1 text-center">
        <div className="text-3xl font-bold text-gray-800">
          {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
        </div>
      </div>

      {/* 玩家資訊 */}
      <div className="col-span-5">
        <div className="flex items-center gap-3">
          <Avatar src={player.avatar} />
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {player.name}
              {isCurrentUser && <span className="ml-2 text-orange-500">(你)</span>}
            </h3>
            <p className="text-sm text-gray-500">{player.location}</p>
          </div>
        </div>
      </div>

      {/* 成績數據 */}
      <div className="col-span-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {player.time}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            平均速度: {player.avgSpeed} km/h
          </div>
        </div>
      </div>

      {/* 排名變化 */}
      <div className="col-span-2 text-right">
        <RankChange change={rankChange} />
      </div>
    </div>

    {/* 展開詳情 */}
    <details className="mt-4">
      <summary className="cursor-pointer text-sm text-gray-600 hover:text-orange-500 transition-colors">
        查看詳細數據 ▼
      </summary>
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <TeamComposition team={player.team} />
        <RouteInfo route={player.route} />
        <PerformanceMetrics metrics={player.metrics} />
      </div>
    </details>
  </div>
);
```

### 排名變化指示器
```jsx
const RankChange = ({ change }) => {
  if (change === 0) return <span className="text-gray-400">→</span>;

  const isUp = change > 0;
  return (
    <div className={`
      flex items-center gap-1
      ${isUp ? 'text-green-500' : 'text-red-500'}
      animate-fadeInSlide
    `}>
      <span className="text-2xl">
        {isUp ? '↑' : '↓'}
      </span>
      <span className="font-bold text-lg">
        {Math.abs(change)}
      </span>
    </div>
  );
};
```

---

## 動畫效果系統

### GSAP 動畫配置

```javascript
// 進入動畫時間軸
const enterTimeline = gsap.timeline({
  defaults: { ease: "power3.out" }
});

// 1. 標題滑入
enterTimeline.from(".leaderboard-title", {
  y: -50,
  opacity: 0,
  duration: 0.6
});

// 2. 標籤頁淡入
enterTimeline.from(".tab-button", {
  y: 20,
  opacity: 0,
  duration: 0.4,
  stagger: 0.1
}, "-=0.3");

// 3. 排名卡片交錯進入
enterTimeline.from(".rank-card", {
  x: -100,
  opacity: 0,
  duration: 0.5,
  stagger: {
    amount: 0.8,
    from: "start"
  }
}, "-=0.2");

// 4. 當前用戶高亮動畫
enterTimeline.to(".current-user-card", {
  scale: 1.02,
  duration: 0.5,
  repeat: 2,
  yoyo: true,
  ease: "power2.inOut"
});

// 排名變化動畫
const rankChangeAnimation = (element, oldRank, newRank) => {
  const tl = gsap.timeline();

  // 發光效果
  tl.to(element, {
    boxShadow: "0 0 30px rgba(255, 107, 53, 0.6)",
    duration: 0.3
  });

  // 位置移動
  tl.to(element, {
    y: (oldRank - newRank) * 80, // 每個排名高度80px
    duration: 1,
    ease: "power2.inOut"
  }, "-=0.2");

  // 數字跳動
  tl.to(element.querySelector(".rank-number"), {
    textContent: newRank,
    duration: 1,
    snap: { textContent: 1 },
    ease: "power1.inOut"
  }, "-=1");

  // 移除發光
  tl.to(element, {
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    duration: 0.3
  });

  return tl;
};

// 實時排名更新動畫
const liveUpdateAnimation = () => {
  // 模擬實時數據更新
  setInterval(() => {
    // 隨機選擇一個排名項目
    const randomCard = document.querySelectorAll('.rank-card')[
      Math.floor(Math.random() * 5)
    ];

    // 閃爍提示新數據
    gsap.to(randomCard, {
      backgroundColor: "#FFF3CD",
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });
  }, 5000);
};

// 載入更多的無限滾動
const infiniteScrollAnimation = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 載入動畫
        gsap.from(entry.target, {
          opacity: 0,
          y: 50,
          duration: 0.5,
          stagger: 0.1
        });
      }
    });
  });

  document.querySelectorAll('.lazy-load').forEach(el => {
    observer.observe(el);
  });
};
```

### 微互動動畫

```javascript
// 懸停效果
const hoverEffects = () => {
  document.querySelectorAll('.rank-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        scale: 1.02,
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        duration: 0.3,
        ease: "power2.out"
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        scale: 1,
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        duration: 0.3,
        ease: "power2.out"
      });
    });
  });
};

// 標籤切換動畫
const tabSwitchAnimation = (oldTab, newTab) => {
  const tl = gsap.timeline();

  // 舊內容淡出
  tl.to('.leaderboard-content', {
    opacity: 0,
    x: -50,
    duration: 0.3,
    ease: "power2.in"
  });

  // 切換內容
  tl.call(() => {
    // 更新內容
  });

  // 新內容淡入
  tl.from('.leaderboard-content', {
    opacity: 0,
    x: 50,
    duration: 0.3,
    ease: "power2.out"
  });

  return tl;
};
```

---

## 響應式設計

### 桌面版 (≥1024px)
```css
/* 三欄布局：排名資訊 + 詳細數據 + 統計圖表 */
@media (min-width: 1024px) {
  .leaderboard-container {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
  }

  .rank-card {
    display: grid;
    grid-template-columns: 80px 2fr 1fr 1fr 100px;
    align-items: center;
    padding: 1.5rem;
  }

  .stats-sidebar {
    position: sticky;
    top: 2rem;
    height: fit-content;
  }
}
```

### 平板版 (768px - 1023px)
```css
@media (min-width: 768px) and (max-width: 1023px) {
  .leaderboard-container {
    max-width: 768px;
    margin: 0 auto;
  }

  .rank-card {
    display: grid;
    grid-template-columns: 60px 1fr auto;
    gap: 1rem;
  }

  .detailed-stats {
    display: none; /* 收合詳細數據 */
  }

  .expand-button {
    display: block; /* 顯示展開按鈕 */
  }
}
```

### 手機版 (<768px)
```css
@media (max-width: 767px) {
  /* 垂直卡片布局 */
  .rank-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1rem;
  }

  /* 簡化標籤 */
  .tab-container {
    display: flex;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .tab-button {
    flex-shrink: 0;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  /* 固定底部操作欄 */
  .bottom-action {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-top: 1px solid #e5e7eb;
    padding: 1rem;
    display: flex;
    justify-content: space-around;
  }
}
```

---

## 空狀態與加載設計

### 空狀態設計
```jsx
const EmptyState = ({ type }) => {
  const messages = {
    global: {
      icon: '🌍',
      title: '成為第一個挑戰者！',
      desc: '目前還沒有任何玩家完成挑戰，立即開始遊戲創造歷史！',
      action: '開始挑戰'
    },
    friends: {
      icon: '👥',
      title: '邀請好友一起競賽',
      desc: '你的好友還沒有遊戲紀錄，分享遊戲邀請他們加入！',
      action: '邀請好友'
    },
    personal: {
      icon: '🚴',
      title: '開始你的騎行之旅',
      desc: '完成第一次挑戰，在排行榜上留下你的印記！',
      action: '立即開始'
    }
  };

  const config = messages[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <div className="text-6xl mb-4 animate-bounce">{config.icon}</div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{config.title}</h3>
      <p className="text-gray-600 text-center max-w-md mb-6">{config.desc}</p>
      <button className="
        px-8 py-3
        bg-gradient-to-r from-orange-500 to-yellow-400
        text-white font-bold rounded-lg
        shadow-lg hover:shadow-xl
        transform hover:scale-105
        transition-all duration-300
      ">
        {config.action}
      </button>
    </div>
  );
};
```

### 載入狀態設計
```jsx
const LoadingState = () => (
  <div className="space-y-4 p-6">
    {/* 骨架屏 */}
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="animate-pulse">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            {/* 排名 */}
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            {/* 玩家資訊 */}
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
            {/* 時間 */}
            <div className="h-6 bg-gray-200 rounded w-20" />
          </div>
        </div>
      </div>
    ))}

    {/* 載入動畫 - 騎行圖標 */}
    <div className="fixed bottom-8 right-8">
      <div className="relative">
        <BikeIcon className="w-12 h-12 text-orange-500 animate-slide" />
        <div className="absolute -bottom-1 w-12 h-1 bg-gray-300 rounded-full" />
      </div>
    </div>
  </div>
);

/* CSS 動畫 */
@keyframes slide {
  0% { transform: translateX(-20px); }
  50% { transform: translateX(20px); }
  100% { transform: translateX(-20px); }
}
```

---

## 組件結構

### 檔案組織
```
src/
├── pages/
│   └── LeaderboardPage.jsx
├── components/
│   └── leaderboard/
│       ├── LeaderboardContainer.jsx
│       ├── LeaderboardTabs.jsx
│       ├── LeaderboardList.jsx
│       ├── LeaderboardItem.jsx
│       ├── RankBadge.jsx
│       ├── RankChange.jsx
│       ├── PlayerStats.jsx
│       ├── TeamComposition.jsx
│       ├── FilterPanel.jsx
│       ├── EmptyState.jsx
│       └── LoadingState.jsx
├── hooks/
│   ├── useLeaderboard.js
│   ├── useRankAnimation.js
│   └── useInfiniteScroll.js
├── services/
│   └── leaderboardService.js
└── styles/
    └── leaderboard.css
```

### 資料流結構
```javascript
// 排行榜資料結構
const leaderboardData = {
  global: {
    entries: [
      {
        rank: 1,
        rankChange: 2,  // 排名上升2位
        player: {
          id: 'user123',
          name: 'WindRider',
          avatar: '/avatars/user123.jpg',
          location: '台北市',
          level: 42,
          achievements: ['speedDemon', 'teamPlayer']
        },
        performance: {
          completionTime: '10:23:45',
          avgSpeed: 36.7,
          maxSpeed: 52.3,
          totalDistance: 380,
          restStops: 3
        },
        team: {
          composition: [
            { type: '破風手', count: 2 },
            { type: '爬坡手', count: 1 },
            { type: '衝刺手', count: 1 }
          ],
          teamwork: 92, // 團隊協作分數
          strategy: 'aggressive'
        },
        route: {
          name: '山線挑戰',
          difficulty: 'hard',
          elevation: 2845,
          scenic: 85
        },
        equipment: {
          bike: 'Carbon Pro 2024',
          totalWeight: 7.2,
          aeroDrag: 0.23
        },
        timestamp: '2024-11-16T10:23:45Z'
      }
    ],
    metadata: {
      totalPlayers: 1527,
      lastUpdated: '2024-11-16T15:30:00Z',
      nextUpdate: '2024-11-16T15:35:00Z'
    }
  }
};
```

---

## 實作程式碼範例

### LeaderboardPage.jsx
```jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { useLeaderboard } from '../hooks/useLeaderboard';
import LeaderboardTabs from '../components/leaderboard/LeaderboardTabs';
import LeaderboardList from '../components/leaderboard/LeaderboardList';
import FilterPanel from '../components/leaderboard/FilterPanel';

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState('global');
  const [filters, setFilters] = useState({});
  const { data, loading, error, refetch } = useLeaderboard(activeTab, filters);

  useEffect(() => {
    // 進入動畫
    const tl = gsap.timeline();
    tl.from('.leaderboard-header', {
      y: -50,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    })
    .from('.tab-button', {
      y: 20,
      opacity: 0,
      duration: 0.4,
      stagger: 0.1,
      ease: 'power3.out'
    }, '-=0.3');

    // 自動刷新（今日榜）
    if (activeTab === 'today') {
      const interval = setInterval(refetch, 30000); // 30秒刷新
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* 頁首 */}
      <header className="leaderboard-header bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              🏆 騎行榮譽榜
            </h1>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <FilterIcon />
            </button>
          </div>
        </div>
      </header>

      {/* 標籤頁 */}
      <LeaderboardTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 主要內容 */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 排行榜列表 */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
              >
                <LeaderboardList
                  data={data}
                  loading={loading}
                  error={error}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 側邊統計 */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <PlayerStatsPanel currentUser={getCurrentUser()} />
              <QuickFilters onFilterChange={setFilters} />
              <AchievementHighlight />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
```

### LeaderboardItem.jsx 詳細實作
```jsx
import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ChevronDown, Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const LeaderboardItem = ({
  data,
  isCurrentUser,
  index,
  onSelect
}) => {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef(null);
  const { rank, rankChange, player, performance, team, route } = data;

  useEffect(() => {
    // 進入動畫
    gsap.from(cardRef.current, {
      x: -100,
      opacity: 0,
      duration: 0.5,
      delay: index * 0.1,
      ease: 'power3.out'
    });

    // 當前用戶高亮
    if (isCurrentUser) {
      gsap.to(cardRef.current, {
        scale: 1.02,
        duration: 0.5,
        repeat: 2,
        yoyo: true,
        ease: 'power2.inOut'
      });
    }
  }, [index, isCurrentUser]);

  const getRankIcon = () => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankChangeIcon = () => {
    if (rankChange > 0) return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (rankChange < 0) return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div
      ref={cardRef}
      className={`
        relative mb-4 bg-white rounded-xl shadow-lg
        transform transition-all duration-500 hover:shadow-xl
        ${isCurrentUser ? 'ring-4 ring-orange-400 bg-gradient-to-r from-orange-50 to-yellow-50' : ''}
      `}
      onClick={() => onSelect(data)}
    >
      {/* 主要內容 */}
      <div className="p-6">
        <div className="flex items-center gap-4">
          {/* 排名 */}
          <div className="flex-shrink-0 text-center">
            <div className="text-3xl font-bold">
              {getRankIcon()}
            </div>
            {rankChange !== 0 && (
              <div className="flex items-center gap-1 mt-1">
                {getRankChangeIcon()}
                <span className={`
                  text-sm font-semibold
                  ${rankChange > 0 ? 'text-green-500' : rankChange < 0 ? 'text-red-500' : 'text-gray-400'}
                `}>
                  {Math.abs(rankChange)}
                </span>
              </div>
            )}
          </div>

          {/* 玩家資訊 */}
          <div className="flex-grow">
            <div className="flex items-center gap-3">
              <img
                src={player.avatar}
                alt={player.name}
                className="w-12 h-12 rounded-full border-2 border-white shadow-md"
              />
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  {player.name}
                  {isCurrentUser && (
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                      YOU
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-500">{player.location}</p>
              </div>
            </div>
          </div>

          {/* 成績 */}
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600">
              {performance.completionTime}
            </div>
            <div className="text-sm text-gray-500">
              {performance.avgSpeed} km/h
            </div>
          </div>

          {/* 展開按鈕 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className={`
              p-2 rounded-lg hover:bg-gray-100 transition-all
              ${expanded ? 'rotate-180' : ''}
            `}
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* 展開內容 */}
      {expanded && (
        <div className="border-t border-gray-100 p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 團隊配置 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">團隊配置</h4>
              <div className="space-y-1">
                {team.composition.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{member.type}</span>
                    <span className="text-sm font-semibold">×{member.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 路線資訊 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">路線選擇</h4>
              <p className="text-sm text-gray-700">{route.name}</p>
              <p className="text-xs text-gray-500">難度: {route.difficulty}</p>
              <p className="text-xs text-gray-500">爬升: {route.elevation}m</p>
            </div>

            {/* 表現指標 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">表現指標</h4>
              <div className="space-y-2">
                <ProgressBar label="團隊協作" value={team.teamwork} />
                <ProgressBar label="風景指數" value={route.scenic} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 進度條組件
const ProgressBar = ({ label, value }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold">{value}%</span>
    </div>
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

export default LeaderboardItem;
```

---

## 互動流程說明

### 使用者旅程
1. **進入排行榜**
   - 從主選單點擊「排行榜」按鈕
   - 頁面載入時顯示載入動畫
   - 自動定位到用戶當前排名

2. **瀏覽排名**
   - 預設顯示全球榜
   - 可切換不同時間維度（今日、本週）
   - 支援無限滾動載入更多

3. **查看詳情**
   - 點擊排名項目展開詳細資訊
   - 顯示團隊配置、路線選擇等
   - 可對比其他玩家數據

4. **篩選搜尋**
   - 按路線類型篩選
   - 按團隊配置篩選
   - 搜尋特定玩家

5. **社交互動**
   - 查看好友排名
   - 發起挑戰
   - 分享成績

### 資料更新機制
- **實時更新**：今日榜每30秒自動刷新
- **推送通知**：排名變化時推送通知
- **快取策略**：其他榜單5分鐘快取

---

## 總結

這套榮譽榜設計方案通過：
1. **視覺吸引力**：獎盃圖標、漸層色彩、動態效果
2. **資訊層次**：清晰的排名展示、詳細數據可展開查看
3. **互動體驗**：流暢的動畫、即時更新、社交元素
4. **響應式適配**：完美支援各種裝置
5. **性能優化**：骨架屏載入、無限滾動、智慧快取

成功打造了一個既有競技感又不失趣味性的排行榜系統，能有效激發玩家的競爭慾望和持續遊玩動力。