# 🚀 START - 一日北高挑戰

## 版本資訊

**當前版本**: v1.1.0
**更新日期**: 2025-11-20
**重大更新**: 全新自動化遊戲系統

---

## ⚡ 快速開始

### 啟動開發伺服器

```bash
npm run dev
```

伺服器將在 `http://localhost:5173/board-game-bike/` 啟動

### 建構生產版本

```bash
npm run build
```

### 預覽生產版本

```bash
npm run preview
```

---

## 🎮 v1.1.0 新特性

### ✨ 全新遊戲體驗

這個版本完全改變了遊戲的玩法：

**舊版 (v1.0.0)**: 即時互動，手動決策
**新版 (v1.1.0)**: 策略預設，自動演示

### 🆕 新增功能

1. **策略預設系統** ⚙️
   - 5個核心決策點
   - 視覺化選擇介面
   - 即時策略總結

2. **30秒自動演示** 🎬
   - GSAP 流暢動畫
   - 30 FPS 播放
   - 即時數據顯示

3. **智能模擬引擎** 🤖
   - 自動處理所有事件
   - 自動調整隊形
   - 自動輪替領騎

---

## 📖 遊戲流程

### 1. 選擇團隊 (預算: $5000)
從 8 種角色中選擇 2-4 位隊員

### 2. 配置裝備
選擇車架、輪組、變速系統

### 3. 設定隊形
選擇單線、雙線或火車陣型

### 4. ⭐ 配置策略 (NEW!)
預先設定 5 個核心策略：
- 比賽節奏 (保守/均衡/激進)
- 補給站策略 (跳過/快速/完整)
- 爬坡應對 (單線/雙人/維持)
- 機械故障 (快速修復/徹底維修/繼續前進)
- 體力輪替閾值 (20-50%)

### 5. 觀看演示
30 秒精彩動畫，自動執行所有決策

### 6. 查看結果
完成時間、得分、排行榜

---

## 🗂️ 專案結構

```
board-game-bike/
├── src/
│   ├── components/
│   │   ├── AutoGameSimulator.jsx     # ⭐ NEW - 自動演示組件
│   │   ├── StrategyConfig.jsx        # ⭐ NEW - 策略配置 UI
│   │   └── ...
│   ├── pages/
│   │   ├── SetupPage.jsx             # 🔄 MODIFIED - 新增策略設定步驟
│   │   ├── GamePage.jsx              # 🔄 MODIFIED - 改為觀看模式
│   │   └── ...
│   ├── services/
│   │   ├── AutoGameSimulator.js      # ⭐ NEW - 自動模擬引擎
│   │   ├── gameEngine.js
│   │   └── ...
│   ├── store/
│   │   ├── strategySlice.js          # ⭐ NEW - 策略狀態管理
│   │   ├── store.js                  # 🔄 MODIFIED - 整合策略 slice
│   │   └── ...
│   └── data/
│       ├── characters.js
│       ├── bikeParts.js
│       ├── routes.js
│       └── events.js
├── docs/
│   └── AUTO_GAME_MECHANICS.md        # ⭐ NEW - 詳細機制說明
├── CHANGELOG.md                      # 🔄 MODIFIED - v1.1.0 更新記錄
├── README.md                         # 🔄 MODIFIED - 新版說明
└── package.json                      # 🔄 MODIFIED - 版本號更新
```

---

## 🧪 測試

### 單元測試

```bash
npm run test
```

### E2E 測試

```bash
# 執行所有測試
npm run test:e2e

# UI 模式（推薦）
npm run test:e2e:ui

# 有頭模式
npm run test:e2e:headed

# 查看測試報告
npm run test:e2e:report
```

---

## 📝 開發指南

### 修改策略選項

編輯 `src/components/StrategyConfig.jsx`：

```javascript
const strategies = {
  pace: [
    {
      id: 'conservative',
      name: '保守推進',
      icon: '🐢',
      desc: '速度 80%，體力消耗 -20%',
      // ...
    },
  ],
}
```

### 調整模擬參數

編輯 `src/services/AutoGameSimulator.js`：

```javascript
// 修改動畫時長
targetDuration: 30, // 改為 60 秒

// 修改隨機事件發生率
const shouldTriggerEvent = Math.random() < 0.15; // 調整機率
```

### 修改策略效果

編輯 `src/services/AutoGameSimulator.js` 中的效果函數：

```javascript
function getSupplyStationEffects(strategy) {
  switch (strategy) {
    case 'quick':
      return {
        timeDelay: 5 * 60,      // 修改時間
        staminaRestore: 15,      // 修改體力恢復量
        moraleChange: 5,         // 修改士氣變化
      };
    // ...
  }
}
```

---

## 🔍 除錯技巧

### 檢查 Console

開啟瀏覽器的開發者工具，查看 Console 輸出：

```
🚴 一日北高挑戰 Taipei to Kaohsiung Challenge
Version: 1.1.0
✨ v1.1.0 全新自動化遊戲系統
⚙️ 策略預設 | 🎬 30秒演示 | 🤖 智能模擬
📖 查看詳情: docs/AUTO_GAME_MECHANICS.md
```

### 檢查 Redux State

使用 Redux DevTools 檢查狀態：
- `strategy` - 策略配置
- `team` - 團隊狀態
- `bike` - 裝備配置
- `game` - 遊戲階段

### 檢查模擬結果

在 `AutoGameSimulator.jsx` 中添加日誌：

```javascript
const handleSimulationComplete = result => {
  console.log('Simulation Result:', result);
  // ...
};
```

---

## 📚 相關文檔

### 核心文檔
- [README.md](./README.md) - 專案概述
- [CHANGELOG.md](./CHANGELOG.md) - 完整更新記錄
- [AUTO_GAME_MECHANICS.md](./docs/AUTO_GAME_MECHANICS.md) - 自動遊戲機制詳細說明

### 設計文檔
- [GAME_DESIGN_DETAILED.md](./GAME_DESIGN_DETAILED.md) - 遊戲設計詳情
- [PLANNING.md](./PLANNING.md) - 專案規劃
- [UI_UX_DESIGN_GUIDE.md](./docs/UI_UX_DESIGN_GUIDE.md) - UI/UX 設計指南

### 技術文檔
- [ENGINE_IMPLEMENTATION_REPORT.md](./ENGINE_IMPLEMENTATION_REPORT.md) - 引擎實現報告
- [BALANCE_TESTING.md](./BALANCE_TESTING.md) - 遊戲平衡測試

---

## 🐛 常見問題

### Q: 開發伺服器無法啟動？
A: 檢查 Node.js 版本 (需要 18+)，確保已執行 `npm install`

### Q: 動畫不流暢？
A: 檢查瀏覽器是否支援 GSAP，嘗試降低 FPS 設定

### Q: 策略設定沒有保存？
A: 檢查 Redux DevTools，確認 `strategy` state 是否更新

### Q: 模擬結果不符合預期？
A: 檢查隨機事件發生率、策略效果參數是否正確

### Q: 如何回到舊版即時互動模式？
A: 目前無法切換，建議查看 git 歷史記錄回退到 v1.0.0

---

## 🚀 部署

### GitHub Pages

專案已配置 GitHub Actions 自動部署：

1. 推送代碼到 `main` 分支
2. GitHub Actions 自動觸發建構
3. 部署到 `gh-pages` 分支
4. 訪問 `https://YOUR_USERNAME.github.io/board-game-bike/`

### 手動部署

```bash
# 建構
npm run build

# 部署到 Firebase Hosting
firebase deploy --only hosting

# 或部署到其他平台
# 將 dist/ 目錄內容上傳即可
```

---

## 💡 貢獻指南

### 提交代碼

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

### 程式碼規範

- 使用 ESLint 檢查代碼
- 使用 Prettier 格式化代碼
- 遵循 React Hooks 最佳實踐
- 添加 PropTypes 驗證
- 撰寫清晰的註釋

---

## 📞 聯絡方式

- **作者**: [Your Name]
- **Email**: bobchen184@gmail.com
- **GitHub**: https://github.com/yanchen184/board-game-bike
- **作品集**: https://yanchen184.github.io/game-portal

---

## 📄 授權

本專案採用 MIT 授權條款

---

## 🎉 致謝

感謝所有貢獻者和測試者！

**Powered by:**
- React 18
- Redux Toolkit
- GSAP
- Tailwind CSS
- Firebase
- Vite

---

**🚴 祝你挑戰成功！**
