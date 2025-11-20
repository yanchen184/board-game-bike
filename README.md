# 🚴 一日北高挑戰 | Taipei to Kaohsiung Cycling Challenge

一款策略型腳踏車競賽遊戲，挑戰在 24 小時內完成台北到高雄 380 公里的長途騎行！

## 🎮 遊戲簡介

**v1.1.0 全新自動化遊戲體驗！**

透過策略規劃團隊陣容、腳踏車裝備和破風隊形，**預先配置所有策略**，然後觀看精彩的 30 秒自動演示，在最短時間內完成一日北高挑戰。遊戲融合了策略規劃、自動化模擬、動畫演示等元素，讓玩家體驗長途自行車賽的魅力。

### 核心特色

- 🎯 **策略規劃** - 平衡預算、選擇最佳團隊組合與裝備
- ⚙️ **策略預設** - 5 個核心決策點，預先配置所有應對策略 ⭐NEW
- 👥 **角色系統** - 8 種專業角色，各有獨特能力
- 🚲 **裝備系統** - 豐富的車架、輪組、變速系統選擇
- 🌪️ **破風隊形** - 3 種隊形策略，影響速度與體力消耗
- 🎬 **自動演示** - 30 秒 GSAP 動畫，完整呈現比賽過程 ⭐NEW
- 🤖 **智能模擬** - 自動執行所有決策，真實物理計算 ⭐NEW
- 📊 **分數評級** - S/A/B/C/D 評級系統，挑戰最高分

## 🎯 遊戲目標

在 24 小時限制內，帶領團隊完成台北到高雄 380 公里的挑戰，獲得最高評分！

## 📖 玩法說明

### 新版遊戲流程 (v1.1.0)

```
選擇團隊 → 配置裝備 → 設定隊形 → ⭐配置策略⭐ → 觀看30秒演示 → 查看結果
```

### 1. 選擇團隊 (預算: $5000)

從 8 種角色中選擇 2-4 位隊員：

- **🚵 爬坡手 (Climber)** - 山路加成 +20%，高海拔適應
- **⚡ 衝刺手 (Sprinter)** - 平路加速 +25%，速度專家
- **🛡️ 副將 (Domestique)** - 隊友體力恢復 +15%，團隊協作
- **🎯 全能型 (All-Rounder)** - 平衡型選手，適應各種地形
- 還有更多角色...

### 2. 配置裝備

選擇合適的腳踏車零件：

- **車架** - 影響重量與空氣動力
- **輪組** - 決定滾動效率
- **變速系統** - 影響爬坡與加速能力

### 3. 設定隊形

選擇最佳破風隊形：

- **單線隊形** - 20% 風阻減少
- **雙線並行** - 15% 風阻減少
- **火車陣型** - 25% 風阻減少

### 4. ⭐ 配置策略 (NEW!)

預先設定 5 個核心策略：

#### 4.1 比賽節奏
- **保守** 🐢 - 速度 80%，體力消耗 -20%
- **均衡** ⚖️ - 標準速度和消耗
- **激進** 🐇 - 速度 120%，體力消耗 +30%

#### 4.2 補給站策略
- **跳過** ⚡ - 不停留，節省時間
- **快速** 🍌 - 5分鐘，恢復 15% 體力
- **完整** 🍔 - 20分鐘，恢復 50% 體力

#### 4.3 爬坡應對
- **單線** ➡️ - 切換單線隊形，效率最高
- **雙人** 👥 - 保持彈性
- **維持** 🔒 - 不切換隊形

#### 4.4 機械故障
- **快速修復** 🔧 - 5分鐘，可能再故障
- **徹底維修** 🛠️ - 15分鐘，不再故障
- **繼續前進** 💨 - 速度 -20%，高風險

#### 4.5 體力輪替
- 設定閾值 (20-50%)
- 領騎體力低於閾值時自動輪替

### 5. 觀看演示

- 🎬 30 秒精彩動畫演示
- 📊 即時數據顯示（距離、時間、速度、體力）
- 🤖 系統自動根據策略執行所有決策
- 🎯 自動處理所有隨機事件

### 6. 查看結果

- 完成時間與距離
- 團隊狀態分析
- 得分與評級
- 排行榜記錄

## 🎨 技術棧

### 前端框架
- **React 18** - 使用 Hooks 與函數式組件
- **Redux Toolkit** - 狀態管理
- **React Router** - 頁面路由
- **Vite** - 建構工具

### UI/UX
- **Tailwind CSS** - 原子化 CSS 框架
- **GSAP** - 動畫引擎
- **React Hot Toast** - 通知系統

### 開發工具
- **ESLint** - 程式碼檢查
- **Prettier** - 程式碼格式化
- **Vitest** - 單元測試

## 🚀 快速開始

### 環境需求

- Node.js 18+
- npm 或 yarn

### 安裝步驟

```bash
# 克隆專案
git clone https://github.com/YOUR_USERNAME/board-game-bike.git
cd board-game-bike

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 打開瀏覽器訪問
# http://localhost:5173
```

### 建構部署

```bash
# 建構生產版本
npm run build

# 預覽建構結果
npm run preview
```

## 📁 專案結構

```
board-game-bike/
├── src/
│   ├── components/       # React 元件
│   │   ├── ui/          # 通用 UI 元件
│   │   ├── CharacterCard.jsx
│   │   ├── ErrorBoundary.jsx
│   │   └── HelpModal.jsx
│   ├── data/            # 遊戲資料
│   │   ├── characters.js
│   │   ├── bikeParts.js
│   │   ├── routes.js
│   │   └── events.js
│   ├── hooks/           # 自定義 Hooks
│   │   └── useGameLoop.js
│   ├── pages/           # 頁面元件
│   │   ├── StartPage.jsx
│   │   ├── SetupPage.jsx
│   │   ├── GamePage.jsx
│   │   └── ResultsPage.jsx
│   ├── services/        # 遊戲邏輯
│   │   ├── calculations.js
│   │   ├── gameEngine.js
│   │   └── storage.js
│   ├── store/           # Redux Store
│   │   ├── gameSlice.js
│   │   ├── teamSlice.js
│   │   ├── bikeSlice.js
│   │   ├── playerSlice.js
│   │   └── store.js
│   ├── utils/           # 工具函數
│   │   └── constants.js
│   ├── App.jsx
│   └── main.jsx
├── public/
├── .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Actions 部署
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🎮 遊戲機制

### 速度計算

```javascript
speed = baseSpeed × formationBonus × aeroDynamics × weatherFactor × terrainFactor
```

### 體力消耗

- 領騎者：1.5x 體力消耗
- 跟隨者：1.0x 體力消耗
- 當體力 < 30% 時自動輪替領騎

### 分數計算

- ⏱️ **時間獎勵** - 完成時間越短，獎勵越高
- 👥 **團隊獎勵** - 完成人數比例
- ⚡ **效率獎勵** - 平均體力保持
- 💰 **預算獎勵** - 節省預算獎勵
- 🎯 **事件處理** - 成功應對事件
- ❌ **故障扣分** - 機械故障懲罰

## 🔧 遊戲設定

### LocalStorage 持久化

遊戲狀態自動保存至瀏覽器 LocalStorage：

- 遊戲進度自動保存
- 支援繼續遊戲功能
- 排行榜記錄（Top 10）

### 效能優化

- React.memo 元件記憶化
- useMemo/useCallback Hooks 優化
- 程式碼分割 (Code Splitting)
- Lazy Loading 路由

## 🚀 GitHub Pages 部署

### 自動部署

專案已配置 GitHub Actions 自動部署：

1. 推送代碼到 `main` 分支
2. GitHub Actions 自動建構
3. 部署至 GitHub Pages

### 手動部署步驟

```bash
# 1. 確保 vite.config.js 中的 base 設定正確
# base: '/board-game-bike/'

# 2. 建構專案
npm run build

# 3. 推送到 GitHub
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main

# 4. 在 GitHub repo 設定中啟用 GitHub Pages
# Settings > Pages > Source: GitHub Actions
```

訪問遊戲：`https://YOUR_USERNAME.github.io/board-game-bike/`

## 🐛 已知問題

- [ ] 移動端觸控優化待改進
- [ ] 音效系統尚未實作

## 🗺️ 開發路線圖

- [x] 核心遊戲機制
- [x] UI/UX 設計
- [x] LocalStorage 持久化
- [x] 錯誤邊界處理
- [x] 效能優化
- [x] GitHub Pages 部署
- [ ] 單元測試完善
- [ ] 音效與音樂
- [ ] 多語言支援
- [ ] 成就系統
- [ ] 排行榜線上同步

## 📄 授權

MIT License

## 🙏 致謝

感謝所有為台灣自行車運動做出貢獻的選手與愛好者！

---

**Made with ❤️ and 🚴 in Taiwan**
