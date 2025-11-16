# 🚴‍♂️ 一日北高挑戰 - 項目規劃書

## 項目概述

**遊戲名稱**: 一日北高挑戰 (Taipei to Kaohsiung Challenge)
**類型**: 策略模擬遊戲
**平台**: 網頁遊戲 (React + Vite)
**目標用戶**: 單車愛好者、策略遊戲玩家

### 核心價值主張
透過遊戲體驗，讓玩家了解長途騎行的策略性規劃，包括團隊合作、裝備選擇、體能管理等真實挑戰。

---

## 一、專案架構設計

### 1.1 資料夾結構

```
board-game-bike/
├── public/
│   ├── assets/
│   │   ├── images/           # 遊戲圖片資源
│   │   ├── sounds/           # 音效檔案
│   │   └── data/            # 靜態數據檔案
│   └── favicon.ico
├── src/
│   ├── components/           # React 組件
│   │   ├── game/            # 遊戲核心組件
│   │   │   ├── GameBoard.jsx
│   │   │   ├── TeamPanel.jsx
│   │   │   ├── RouteMap.jsx
│   │   │   └── StatusBar.jsx
│   │   ├── ui/              # UI 組件
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Card.jsx
│   │   │   └── ProgressBar.jsx
│   │   ├── setup/           # 遊戲設置組件
│   │   │   ├── TeamBuilder.jsx
│   │   │   ├── BikeCustomizer.jsx
│   │   │   └── StrategyPlanner.jsx
│   │   └── results/         # 結果展示組件
│   │       ├── ResultsScreen.jsx
│   │       └── Leaderboard.jsx
│   ├── hooks/               # 自定義 React Hooks
│   │   ├── useGameState.js
│   │   ├── useAnimation.js
│   │   └── useLocalStorage.js
│   ├── store/               # 狀態管理
│   │   ├── gameSlice.js
│   │   ├── teamSlice.js
│   │   ├── bikeSlice.js
│   │   └── store.js
│   ├── services/            # 業務邏輯與 API
│   │   ├── gameEngine.js
│   │   ├── calculations.js
│   │   └── storage.js
│   ├── utils/               # 工具函數
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── animations.js
│   ├── data/                # 遊戲數據定義
│   │   ├── characters.js
│   │   ├── bikeParts.js
│   │   ├── routes.js
│   │   └── events.js
│   ├── styles/              # 樣式檔案
│   │   ├── index.css
│   │   └── tailwind.css
│   ├── App.jsx
│   └── main.jsx
├── tests/                    # 測試檔案
├── .env
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
├── README.md
├── PLANNING.md              # 本文件
├── TASK.md                  # 任務追蹤
└── CLAUDE.md               # AI 開發指南
```

### 1.2 主要組件規劃

#### 核心組件
1. **GameController** - 遊戲主控制器
2. **TeamManager** - 團隊管理系統
3. **BikeConfigurator** - 腳踏車配置系統
4. **RouteSimulator** - 路線模擬器
5. **EnergySystem** - 體力管理系統
6. **EventManager** - 隨機事件處理器

### 1.3 狀態管理方案

使用 **Redux Toolkit** 進行全局狀態管理：

```javascript
// Store 結構
{
  game: {
    phase: 'setup' | 'racing' | 'results',
    currentDistance: 0,
    totalDistance: 380, // 北高距離 (km)
    timeElapsed: 0,
    weather: {},
    events: []
  },
  team: {
    members: [],
    formation: 'single' | 'double' | 'train',
    morale: 100,
    fatigue: 0
  },
  bike: {
    frame: {},
    wheels: {},
    gears: {},
    accessories: [],
    totalWeight: 0,
    aeroDynamics: 0
  },
  player: {
    name: '',
    bestTime: null,
    achievements: []
  }
}
```

---

## 二、遊戲機制設計

### 2.1 團隊陣容系統

#### 角色類型與屬性
```javascript
const characterTypes = {
  CLIMBER: {
    name: "爬坡手",
    stamina: 80,
    speed: 70,
    teamwork: 60,
    specialty: "山路加成 +20%"
  },
  SPRINTER: {
    name: "衝刺手",
    stamina: 60,
    speed: 100,
    teamwork: 50,
    specialty: "平路加成 +25%"
  },
  DOMESTIQUE: {
    name: "破風手",
    stamina: 90,
    speed: 75,
    teamwork: 100,
    specialty: "團隊體力消耗 -15%"
  },
  ALL_ROUNDER: {
    name: "全能選手",
    stamina: 75,
    speed: 75,
    teamwork: 75,
    specialty: "適應各種路況"
  }
}
```

### 2.2 破風隊伍機制

#### 隊形系統
1. **單線隊形** - 風阻減少 20%，但後方選手視野受限
2. **雙線並行** - 風阻減少 15%，容易應對突發狀況
3. **火車陣型** - 風阻減少 25%，需要高團隊配合度

#### 輪替機制
- 每 30 分鐘自動輪替領騎
- 可手動調整輪替順序
- 領騎消耗體力 1.5 倍

### 2.3 腳踏車零件系統

```javascript
const bikeParts = {
  frames: [
    { name: "碳纖維競賽", weight: 6.8, aero: 90, cost: 3000 },
    { name: "鋁合金耐久", weight: 8.5, aero: 70, cost: 1500 },
    { name: "鋼管經典", weight: 10, aero: 60, cost: 800 }
  ],
  wheels: [
    { name: "碳纖板輪", weight: 1.2, aero: 95, stability: 60 },
    { name: "鋁合金爬坡輪", weight: 1.5, aero: 75, stability: 85 },
    { name: "耐久訓練輪", weight: 1.8, aero: 65, stability: 95 }
  ],
  gears: [
    { name: "電子變速", precision: 95, weight: 0.25, durability: 85 },
    { name: "機械變速", precision: 80, weight: 0.35, durability: 95 }
  ]
}
```

### 2.4 事前準備系統

#### 準備項目
1. **訓練計畫** (影響初始體力)
   - 高強度間歇 (+20% 速度, -10% 耐力)
   - 長距離耐力 (+30% 耐力, -5% 速度)
   - 均衡訓練 (+10% 全能力)

2. **補給策略** (影響續航力)
   - 能量棒 × 數量
   - 運動飲料 × 數量
   - 水 × 數量
   - 補給站規劃

3. **路線規劃** (影響效率)
   - 西部濱海線 (平坦但風大)
   - 山線 (爬坡多但風景優美)
   - 混合路線 (平衡選擇)

### 2.5 通關條件與評分

#### 完成條件
- 成功抵達高雄 (380km)
- 團隊至少 50% 成員完成
- 時間限制：24 小時

#### 評分標準
```javascript
const scoring = {
  timeBonus: (24 - actualHours) * 100,  // 時間獎勵
  teamBonus: completedMembers * 50,      // 團隊完整度
  efficiencyBonus: (1 - fatigueRate) * 200, // 效率獎勵
  specialBonus: {
    noDropout: 500,      // 全員完成
    underBudget: 300,    // 預算內完成
    perfectWeather: 200  // 順利躲避惡劣天氣
  }
}
```

---

## 三、開發階段規劃

### Phase 1: MVP 功能 (第 1-2 週)

**目標**: 建立可玩的基礎版本

1. **基礎架構搭建**
   - 初始化 React + Vite 項目
   - 設置 Tailwind CSS
   - 配置 Redux Toolkit
   - 建立基本路由

2. **核心遊戲循環**
   - 團隊選擇介面 (3 個預設角色)
   - 簡單的腳踏車配置 (3 種預設配置)
   - 基本路線模擬 (自動前進)
   - 體力消耗機制
   - 完成判定

3. **基礎 UI**
   - 開始畫面
   - 遊戲進行畫面 (進度條 + 狀態顯示)
   - 結果畫面

### Phase 2: 進階功能 (第 3-4 週)

**目標**: 增加深度與策略性

1. **進階團隊系統**
   - 完整的 4 種角色類型
   - 破風隊形切換
   - 輪替機制
   - 團隊士氣系統

2. **詳細零件系統**
   - 10+ 種零件選擇
   - 零件組合加成
   - 預算限制
   - 重量與空氣動力學計算

3. **隨機事件系統**
   - 天氣變化 (順風/逆風/雨天)
   - 機械故障
   - 補給站
   - 路況變化

4. **GSAP 動畫**
   - 騎乘動畫
   - 隊形變換動畫
   - 進度展示動畫
   - 成就解鎖動畫

### Phase 3: 優化和部署 (第 5-6 週)

**目標**: 完善體驗並上線

1. **遊戲平衡**
   - 數值調整
   - 難度曲線優化
   - 測試各種策略組合

2. **用戶體驗優化**
   - 教學模式
   - 提示系統
   - 快速重玩
   - 成就系統

3. **性能優化**
   - 代碼分割
   - 圖片壓縮
   - 懶加載
   - 快取策略

4. **部署上線**
   - GitHub Actions CI/CD
   - 部署到 GitHub Pages
   - 域名配置
   - 數據分析整合

---

## 四、技術選型建議

### 4.1 核心依賴

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@reduxjs/toolkit": "^2.0.0",
    "react-redux": "^9.0.0",
    "gsap": "^3.12.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.48.0",
    "react-hot-toast": "^2.4.0",
    "clsx": "^2.0.0",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "@types/react": "^18.2.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",
    "vitest": "^1.1.0",
    "@testing-library/react": "^14.1.0"
  }
}
```

### 4.2 GSAP 動畫應用

1. **場景轉換** - 使用 Timeline 創建流暢的場景切換
2. **角色動畫** - SVG 動畫展示騎乘狀態
3. **數據可視化** - 動態圖表展示進度和狀態
4. **互動反饋** - 按鈕點擊、拖拽等互動效果
5. **成就系統** - 華麗的解鎖動畫

### 4.3 資料存儲方案

#### LocalStorage (MVP)
```javascript
// 存儲結構
const gameData = {
  playerProfile: {},
  gameProgress: {},
  achievements: [],
  settings: {},
  leaderboard: []
}
```

#### Firebase (未來擴展)
- Firestore: 存儲玩家資料和排行榜
- Authentication: 玩家登入系統
- Hosting: 替代 GitHub Pages
- Analytics: 遊戲數據分析

---

## 五、風險評估與緩解策略

### 技術風險

| 風險 | 影響 | 機率 | 緩解策略 |
|-----|------|------|----------|
| GSAP 性能問題 | 高 | 中 | 使用 will-change、GPU 加速、動畫節流 |
| 狀態管理複雜度 | 中 | 高 | 模組化設計、清晰的資料流 |
| 移動裝置適配 | 高 | 中 | 響應式設計、觸控優化、性能測試 |
| 瀏覽器兼容性 | 中 | 低 | Polyfills、漸進增強 |

### 項目風險

| 風險 | 影響 | 機率 | 緩解策略 |
|-----|------|------|----------|
| 範圍蔓延 | 高 | 高 | 嚴格的 MVP 定義、功能優先級 |
| 遊戲平衡性 | 高 | 中 | 迭代測試、數據收集、玩家反饋 |
| 用戶留存率低 | 高 | 中 | 成就系統、排行榜、社交分享 |

---

## 六、成功指標 (KPIs)

### 技術指標
- Lighthouse 分數 > 90
- 首次內容繪製 (FCP) < 1.5s
- 互動時間 (TTI) < 3.5s
- 無障礙分數 > 85

### 業務指標
- 平均遊戲時長 > 15 分鐘
- 完成率 > 30%
- 重玩率 > 40%
- 分享率 > 10%

### 用戶滿意度
- 遊戲機制清晰度：4/5
- 策略深度：4/5
- 視覺呈現：4.5/5
- 整體體驗：4/5

---

## 七、後續擴展方向

1. **多人模式** - 即時對戰、合作模式
2. **賽季系統** - 定期更新路線和挑戰
3. **自定義內容** - 玩家創建路線、分享配置
4. **真實數據整合** - 天氣 API、真實路況
5. **社群功能** - 車隊系統、討論區
6. **周邊系統** - 虛擬貨幣、裝備收集

---

## 總結

「一日北高挑戰」將策略規劃與單車文化結合，透過遊戲化的方式讓玩家體驗長途騎行的挑戰與樂趣。專案採用現代化技術棧，注重性能與用戶體驗，並保留充分的擴展空間。

透過分階段開發，我們能夠快速推出 MVP 版本收集反饋，再逐步完善功能，最終打造一款兼具教育意義與娛樂性的優質網頁遊戲。