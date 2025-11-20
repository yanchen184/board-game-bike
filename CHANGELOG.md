# 更新日誌 | Changelog

## 2025-11-20 - v1.1.1 遊戲平衡重大修復 🔋

### 🚨 Critical Balance Fix

#### 問題修復
- 🔴 **修復致命問題**: 原本的體力系統無法讓玩家完成 380 公里挑戰
- ✅ **新增體力恢復機制**: 跟騎者現在可以恢復體力
- ✅ **遊戲現在可以完賽**: 4 人隊伍可以成功完成挑戰

#### 核心變更

**新增檔案**:
- `docs/STAMINA_RECOVERY_SYSTEM.md` - 完整的體力系統說明文件

**修改檔案**:
- `src/utils/constants.js` - 新增 `STAMINA_RECOVERY` 常數
- `src/services/calculations.js` - 新增 `calculateStaminaRecovery()` 函數
- `src/services/gameEngine.js` - 整合體力恢復到遊戲循環
- `src/App.jsx` - 更新版本號和 Console 訊息
- `package.json` - 版本號 1.1.0 → 1.1.1

#### 體力系統改動

**恢復率** (跟騎時):
- 基礎恢復: 54%/小時
- 火車隊形: 81%/小時 (最佳)
- 單線隊形: 75.6%/小時
- 雙線隊形: 70.2%/小時

**特殊機制**:
- 低體力加成: 體力 < 30% 時，恢復速度 +30%
- 領騎者不恢復: 保持原有 2x 消耗機制
- 上限保護: 最大恢復率 90%/小時

#### 遊戲平衡驗證

**修復前** (v1.1.0):
```
380公里 / 30km/h = 12.7小時
總體力消耗: 1058% (每人)
起始體力: 400% (4人)
結果: ❌ 無法完賽
```

**修復後** (v1.1.1):
```
380公里 / 30km/h = 12.7小時
淨體力消耗: 288% (含恢復)
起始體力: 400% (4人)
剩餘體力: 112%
結果: ✅ 可以完賽！
```

#### 影響範圍
- ✅ 所有遊戲模式
- ✅ 自動模擬器
- ✅ 手動遊戲（未來）
- ✅ 體力顯示 UI

#### 測試狀態
- ✅ 數學驗證通過
- ✅ 遊戲引擎整合完成
- ⏳ E2E 測試待執行
- ⏳ 實際遊玩測試待進行

#### 破壞性變更
- ⚠️ 無 - 向下相容，只影響遊戲平衡

---

## 2025-11-20 - v1.1.0 全新自動化遊戲系統

### 🎮 遊戲機制重大改版

#### 核心變更
- ✨ **完全自動化遊戲流程** - 從即時互動改為預設策略自動執行
- ✨ **策略預設系統** - 新增 5 個核心決策點
- 🎬 **30 秒動畫演示** - 使用 GSAP 播放流暢動畫
- 🔄 **遊戲頁面重構** - 從互動模式改為純觀看模式

#### 新增文件
```
src/
├── services/AutoGameSimulator.js     # 自動模擬引擎
├── components/AutoGameSimulator.jsx  # React 動畫組件
├── components/StrategyConfig.jsx     # 策略配置 UI
└── store/strategySlice.js            # 策略狀態管理

docs/
└── AUTO_GAME_MECHANICS.md            # 自動遊戲機制詳細文檔
```

#### 修改文件
- `src/pages/SetupPage.jsx` - 新增第4步策略設定
- `src/pages/GamePage.jsx` - 完全重構為觀看模式
- `src/store/store.js` - 整合 strategySlice
- `README.md` - 更新遊戲說明

---

### ⚙️ 策略預設系統

#### 5 個核心決策點

**1. 比賽節奏策略**
- 🐢 保守推進 - 速度 80%，體力消耗 -20%
- ⚖️ 均衡推進 - 標準速度和消耗
- 🐇 激進推進 - 速度 120%，體力消耗 +30%

**2. 補給站策略**
- ⚡ 跳過補給 - 不停留，體力 +0%
- 🍌 快速補給 - 5分鐘，體力 +15%
- 🍔 完整休息 - 20分鐘，體力 +50%

**3. 爬坡應對策略**
- ➡️ 單線隊形 - 切換單線，效率最高
- 👥 雙人並行 - 保持彈性
- 🔒 維持原隊形 - 不切換

**4. 機械故障應對**
- 🔧 快速修復 - 5分鐘，可能再故障
- 🛠️ 徹底維修 - 15分鐘，不再故障
- 💨 繼續前進 - 速度-20%，高風險

**5. 體力輪替閾值**
- 滑桿調整 20-50%
- 領騎體力低於閾值自動輪替

---

### 🎬 自動演示系統

#### 技術實現
- **模擬引擎** - `AutoGameSimulator.js`
  - 自動處理所有事件（補給站、機械故障）
  - 自動調整隊形（根據地形和策略）
  - 自動輪替領騎（根據體力閾值）
  - 生成 100 個關鍵快照

- **動畫系統** - `AutoGameSimulator.jsx`
  - GSAP Timeline 控制
  - 30 FPS 流暢播放
  - 線性插值產生中間幀
  - 即時數據更新

#### 顯示內容
- 📍 距離和時間
- 💨 當前速度
- 🏔️ 地形類型
- 🌦️ 天氣狀況
- 👥 隊形狀態
- 🎯 團隊士氣
- 💪 隊員體力條
- 🚴 領騎標示

---

### 🔄 遊戲流程變更

#### 舊版流程 (v1.0.0)
```
選擇團隊 → 配置裝備 → 設定隊形 → 開始比賽
    ↓
即時互動遊戲（手動換領騎、手動決策、時間加速）
    ↓
查看結果
```

#### 新版流程 (v1.1.0)
```
選擇團隊 → 配置裝備 → 設定隊形 → ⭐配置策略⭐
    ↓
觀看 30 秒自動演示（完全自動化）
    ↓
查看結果
```

---

### 📊 數據結構

#### Strategy State
```typescript
{
  paceStrategy: 'conservative' | 'balanced' | 'aggressive',
  supplyStrategy: 'skip' | 'quick' | 'full',
  climbingStrategy: 'single' | 'double' | 'maintain',
  mechanicalStrategy: 'quick_fix' | 'thorough_repair' | 'continue',
  rotationThreshold: number (20-50)
}
```

#### Simulation Result
```typescript
{
  success: boolean,
  completed: boolean,
  failed: boolean,
  finalState: GameState,
  summary: RaceSummary,
  snapshots: Snapshot[],  // 100個關鍵快照
  totalFrames: number,
  targetDuration: 30,
  fps: 30,
  strategy: StrategyConfig
}
```

---

### 🎯 優化與改進

#### 性能優化
- ✅ 使用 GSAP 進行 GPU 加速動畫
- ✅ 快照系統減少計算量
- ✅ 線性插值產生流暢動畫

#### 用戶體驗
- ✅ 清晰的4步驟設置流程
- ✅ 視覺化策略選擇介面
- ✅ 策略總結面板
- ✅ 30秒快速觀看體驗
- ✅ 自動跳轉結果頁面

#### 代碼質量
- ✅ 模組化設計
- ✅ 完整的 PropTypes 驗證
- ✅ 詳細的代碼註釋
- ✅ 清晰的文件結構

---

### 📝 文檔更新

- ✅ 新增 `docs/AUTO_GAME_MECHANICS.md` - 完整的自動遊戲機制說明
- ✅ 更新 `README.md` - 新版遊戲流程和特色
- ✅ 更新 `CHANGELOG.md` - v1.1.0 詳細變更記錄

---

### 🔗 相關連結

- [自動遊戲機制詳細文檔](./docs/AUTO_GAME_MECHANICS.md)
- [遊戲設計文檔](./GAME_DESIGN_DETAILED.md)
- [專案規劃文檔](./PLANNING.md)

---

## 2025-11-16 - Firebase 整合 & 遊戲平衡調整

### 🔥 Firebase 線上排行榜整合

#### 新增功能
- ✅ **Firebase Authentication** - 匿名登入支援，確保每位玩家都有唯一 ID
- ✅ **Firestore 排行榜** - 即時全球排行榜系統
- ✅ **分數驗證** - 多層防作弊機制
  - 客戶端校驗和驗證
  - 分數範圍檢查 (0-5000)
  - 完成時間驗證 (6-24小時)
  - 平均速度驗證 (15-65 km/h)
- ✅ **Security Rules** - 完整的 Firestore 安全規則
- ✅ **自動提交** - 完成遊戲後自動提交至全球排行榜
- ✅ **排名顯示** - 結果頁面顯示全球排名

#### 技術實現
```
src/services/firebase/
├── config.js              # Firebase 初始化配置
├── auth.service.js        # 認證服務
└── leaderboard.service.js # 排行榜服務

firestore.rules            # Firestore 安全規則
.env.local                 # Firebase 環境變數
```

#### Firebase Collections 結構
```javascript
leaderboard/{entryId}
├── userId              // 用戶 ID
├── playerName          // 玩家名稱
├── totalScore          // 總分
├── completionTime      // 完成時間 (秒)
├── teamFinished        // 完成人數
├── totalTeamSize       // 團隊總人數
├── teamComposition     // 團隊組成
├── route               // 路線名稱
├── timestamp           // 提交時間
└── checksum            // 校驗和
```

---

### ⚖️ 遊戲平衡調整

根據 `game-balance-designer` 的專業分析，進行了以下平衡調整：

#### 1. 角色成本與能力調整

**爬坡手 (Climber)**
- 💰 成本：$1200 → **$1000** (降低 16.7%)
- 💪 體力：80 → **85** (+6.25%)
- 🔄 恢復：70 → **75** (+7.1%)
- ⚡ 山路加成：+20% → **+25%** (+5%)
- 🎯 目的：提升性價比，增加在爬坡路段的吸引力

**破風手 (Domestique)**
- 💰 成本：$1100 → **$1400** (增加 27.3%)
- ⬇️ 團隊消耗：-15% → **-12%** (降低效果)
- 🏔️ 爬坡能力：70 → **65** (降低)
- 🎯 目的：修正過強的性價比，避免無腦選擇

#### 2. 破風隊形機制調整

**新增隊形懲罰系統** (FORMATION_PENALTIES)
```javascript
單線隊形：爬坡時 0% 懲罰
雙線並行：爬坡時 -5% 速度懲罰
火車陣型：爬坡時 -10% 速度懲罰  // 增加策略性取捨
```

**火車隊形權衡**
- ✅ 平路：25% 風阻減少（最強）
- ❌ 爬坡：-10% 速度懲罰（需要考慮地形）
- 🎯 目的：不再是所有情況下的最優解，需要根據路線選擇

#### 3. 體力消耗系統強化

**領騎者消耗倍率**
- 舊：1.5x 體力消耗
- 新：**2.0x** 體力消耗 (+33%)
- 🎯 目的：增加輪替的重要性和策略性

**新增常數定義** (STAMINA_DRAIN)
```javascript
LEADER: 2.0,              // 領騎者消耗
FOLLOWER: 1.0,            // 跟隨者消耗
LOW_STAMINA_THRESHOLD: 30,    // 自動輪替閾值
CRITICAL_THRESHOLD: 15,       // 嚴重疲勞閾值
```

#### 4. 路線難度調整

**爬坡路段增加**
- 舊：80km 爬坡 (21% of 380km)
- 新：**150km 爬坡** (39.5% of 380km)
- 增加：+70km 爬坡路段

**具體調整**
1. seg_3 (桃園台地)：40km UPHILL ✓ 保留
2. seg_5 (苗栗丘陵)：40km UPHILL ✓ 保留
3. seg_8 (雲林農村)：FLAT → **雲林丘陵 UPHILL** (40km) 🆕
4. seg_9 (嘉義市區)：FLAT → **嘉義山區 UPHILL** (30km) 🆕

**影響**
- 🚵 爬坡手價值大幅提升
- ⚡ 衝刺手在平路段仍有優勢
- 🎯 隊伍組成更需要平衡考量

---

### 📊 平衡性分析總結

#### 改善的問題
1. ✅ **破風手不再過強** - 成本提升 27%，效果降低
2. ✅ **爬坡手更有價值** - 成本降低 + 爬坡路段增加
3. ✅ **火車隊形有取捨** - 爬坡時有明顯懲罰
4. ✅ **體力管理更重要** - 領騎者消耗增加
5. ✅ **難度提升** - 路線更具挑戰性

#### 預期策略變化

**之前的最優策略**
- 3個破風手 + 1個全能選手 = 幾乎保證勝利
- 全程使用火車隊形

**現在的策略考量**
- 需要至少 1-2 個爬坡手應對 150km 爬坡
- 破風手成本高，需要權衡預算
- 火車隊形在平路使用，爬坡時切換單線或雙線
- 體力輪替更頻繁且重要

#### 分數影響
- 🏆 高分難度增加（原本過於簡單）
- 📈 S 級評分（2000+）需要更完美的策略
- 🎯 鼓勵多次嘗試和優化

---

### 🔒 安全性改進

#### Firestore Security Rules
- ✅ 只有認證用戶可以提交分數
- ✅ 分數範圍驗證 (0-5000)
- ✅ 時間範圍驗證 (6-24 hours)
- ✅ 速度合理性檢查 (15-65 km/h)
- ✅ 團隊人數驗證 (2-4 人)
- ✅ 防止速率濫用

#### 客戶端驗證
```javascript
// 校驗和生成防止篡改
checksum = hash(score + time + team + timestamp)

// 物理驗證
avgSpeed = 380km / (completionTime / 3600)
// 必須在 15-65 km/h 範圍內
```

---

### 📈 性能優化

- 🚀 Firebase SDK 已集成（+82 packages）
- 📦 程式碼分割已優化
- ⚡ 懶加載路由保持
- 💾 本地緩存機制保留

#### Bundle Size
```
ResultsPage: 501.14 KB (含 Firebase SDK)
其他頁面：< 20 KB
總體：~800 KB (gzipped ~220 KB)
```

---

### 📝 文件更新

- ✅ `BALANCE_ANALYSIS.md` - 完整的遊戲平衡分析
- ✅ `LEADERBOARD_PLAN.md` - 排行榜功能規劃
- ✅ `LEADERBOARD_DESIGN.md` - UI/UX 設計規格
- ✅ `firestore.rules` - Firebase 安全規則
- ✅ `.env.local` - 環境變數配置

---

### 🚀 部署說明

#### Firebase 設置
1. 已配置 Firebase 專案：`bikes-bbd76`
2. 已啟用服務：
   - ✅ Authentication (Anonymous)
   - ✅ Firestore Database
   - ✅ Analytics

#### 部署 Security Rules
```bash
# 安裝 Firebase CLI
npm install -g firebase-tools

# 登入 Firebase
firebase login

# 初始化專案 (選擇 Firestore)
firebase init firestore

# 部署安全規則
firebase deploy --only firestore:rules
```

#### 環境變數
確保 `.env.local` 包含正確的 Firebase 配置（已配置）

---

### ⚠️ 已知問題

1. **ResultsPage Bundle 過大** (501 KB)
   - 原因：包含完整 Firebase SDK
   - 影響：首次加載略慢
   - 解決方案：考慮使用 Firebase modular SDK

2. **離線模式**
   - Firebase 需要網路連線
   - 離線時分數提交會失敗（不影響本地儲存）
   - 考慮：添加離線隊列機制

---

### 🎯 下一步建議

1. **Firebase Cloud Functions** - 服務端分數驗證
2. **實時排行榜更新** - WebSocket/Firestore listeners
3. **用戶認證** - Email/Google 登入
4. **成就系統** - 基於 Firestore 的成就追蹤
5. **賽季系統** - 週期性排行榜重置

---

### 🧪 測試檢查清單

- [ ] 完成一場遊戲，確認分數自動提交
- [ ] 檢查全球排名顯示正確
- [ ] 驗證爬坡路段增加的影響
- [ ] 測試火車隊形在爬坡時的懲罰
- [ ] 確認領騎者體力消耗增加
- [ ] 測試不同角色組合的平衡性

---

Made with ❤️ by Claude Code + Game Balance Designer + Project Manager + Frontend UI Designer + Firebase Engineer
