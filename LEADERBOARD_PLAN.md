# 📊 榮譽榜（Leaderboard）功能實現規劃

## 一、總體架構分析

### 1.1 現況評估

#### 已實現功能
- ✅ 本地 localStorage 排行榜（限前 10 名）
- ✅ 完整的分數計算系統（時間、團隊、效率、預算等）
- ✅ Redux Toolkit 狀態管理
- ✅ 結果頁面展示功能
- ✅ GSAP 動畫系統

#### 技術限制
- ❌ 本地存儲容量限制（僅能存前 10 名）
- ❌ 無法跨設備同步數據
- ❌ 缺乏用戶身份驗證
- ❌ 無法防止數據篡改
- ❌ 缺少全球排名功能

### 1.2 目標設定

#### 短期目標（MVP - 2 週）
1. Firebase 基礎整合
2. 線上排行榜（前 100 名）
3. 基本防作弊機制
4. 排行榜 UI 界面

#### 中期目標（1 個月）
1. 用戶身份驗證
2. 多維度排行榜（總分、速度、團隊等）
3. 歷史記錄查詢
4. 社交分享功能

#### 長期目標（3 個月）
1. 賽季系統
2. 成就系統
3. 車隊/團隊排行榜
4. 數據分析儀表板

---

## 二、Firebase 技術方案

### 2.1 Firebase 產品選擇

#### **推薦方案：Firestore + Authentication**

| 功能需求 | Firestore | Realtime Database | 選擇理由 |
|---------|-----------|-------------------|---------|
| 查詢能力 | ✅ 複雜查詢、排序、過濾 | ❌ 簡單查詢 | 需要多維度排行榜 |
| 數據結構 | ✅ 文檔結構清晰 | ❌ JSON 樹狀結構 | 易於管理和擴展 |
| 離線支持 | ✅ 內建離線緩存 | ✅ 需手動配置 | 提升用戶體驗 |
| 價格 | 按讀寫次數 | 按流量計算 | 適合排行榜場景 |
| 實時更新 | ✅ 支持監聽 | ✅ 原生支持 | 都能滿足需求 |

### 2.2 數據結構設計

```javascript
// Firestore 集合結構
{
  // leaderboard 集合 - 主排行榜
  "leaderboard": {
    "documentId": {
      // 核心數據
      "userId": "user123",          // 可選：用戶 ID
      "playerName": "王小明",        // 玩家名稱
      "totalScore": 2150,           // 總分（用於排序）
      "completionTime": 43200,      // 完成時間（秒）
      "timestamp": "2024-11-16T10:30:00Z", // ISO 時間戳

      // 遊戲數據
      "gameData": {
        "distance": 380,            // 完成距離
        "teamFinished": 4,          // 完成人數
        "totalTeamSize": 4,         // 團隊總人數
        "averageFatigue": 0.25,     // 平均疲勞度
        "formation": "train",       // 使用隊形
        "bikeType": "carbon",       // 車輛類型
        "route": "coastal"          // 路線選擇
      },

      // 分數明細
      "scoreBreakdown": {
        "timeBonus": 600,
        "teamBonus": 500,
        "efficiencyBonus": 225,
        "budgetBonus": 100,
        "eventBonus": 150,
        "specialBonus": 700,
        "failurePenalty": -125
      },

      // 驗證數據（防作弊）
      "validation": {
        "gameVersion": "0.0.1",     // 遊戲版本
        "checksum": "hash...",      // 數據校驗和
        "sessionId": "session123",  // 會話 ID
        "platform": "web",          // 平台
        "userAgent": "Chrome/119"   // 瀏覽器信息
      },

      // 元數據
      "metadata": {
        "isVerified": false,        // 是否已驗證
        "reportCount": 0,           // 被舉報次數
        "likeCount": 0,             // 點讚數
        "viewCount": 0              // 查看次數
      }
    }
  },

  // userProfiles 集合 - 用戶資料（可選）
  "userProfiles": {
    "userId": {
      "displayName": "王小明",
      "avatar": "url...",
      "totalGames": 15,
      "bestScore": 2150,
      "achievements": ["first_win", "speed_demon"],
      "joinDate": "2024-11-01",
      "stats": {
        "totalDistance": 5700,
        "totalTime": 648000,
        "winRate": 0.8
      }
    }
  },

  // seasons 集合 - 賽季數據（未來擴展）
  "seasons": {
    "2024-Q4": {
      "name": "冬季挑戰賽",
      "startDate": "2024-10-01",
      "endDate": "2024-12-31",
      "leaderboard": [] // 賽季排行榜引用
    }
  }
}
```

### 2.3 Firestore 索引設計

```javascript
// 必要的複合索引
const indexes = [
  // 主排行榜（總分降序）
  {
    collection: "leaderboard",
    fields: [
      { field: "totalScore", order: "desc" },
      { field: "timestamp", order: "desc" }
    ]
  },

  // 速度排行榜（時間升序）
  {
    collection: "leaderboard",
    fields: [
      { field: "completionTime", order: "asc" },
      { field: "timestamp", order: "desc" }
    ]
  },

  // 團隊完整度排行榜
  {
    collection: "leaderboard",
    fields: [
      { field: "gameData.teamFinished", order: "desc" },
      { field: "totalScore", order: "desc" }
    ]
  },

  // 用戶歷史記錄
  {
    collection: "leaderboard",
    fields: [
      { field: "userId", order: "asc" },
      { field: "timestamp", order: "desc" }
    ]
  }
];
```

---

## 三、安全性設計

### 3.1 Firebase Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 排行榜規則
    match /leaderboard/{document} {
      // 所有人可讀取
      allow read: if true;

      // 寫入限制
      allow create: if request.auth != null  // 需要認證（可選）
        && isValidScore(request.resource.data)
        && !isDuplicate(request.resource.data)
        && rateLimit();

      // 禁止更新和刪除
      allow update: if false;
      allow delete: if false;
    }

    // 用戶資料規則
    match /userProfiles/{userId} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.uid == userId;
    }

    // 驗證函數
    function isValidScore(data) {
      return data.totalScore >= 0
        && data.totalScore <= 5000  // 合理分數範圍
        && data.completionTime >= 25200  // 最少 7 小時
        && data.completionTime <= 86400  // 最多 24 小時
        && data.gameData.distance == 380
        && data.gameData.teamFinished <= data.gameData.totalTeamSize;
    }

    function isDuplicate(data) {
      // 檢查 5 分鐘內是否有相同會話提交
      return exists(/databases/$(database)/documents/leaderboard/$(data.sessionId));
    }

    function rateLimit() {
      // 限制每個 IP 每小時最多 10 次提交
      return true; // 需要配合 Cloud Functions 實現
    }
  }
}
```

### 3.2 防作弊機制

#### 客戶端驗證
```javascript
// 數據完整性校驗
function generateChecksum(gameData) {
  const secret = import.meta.env.VITE_GAME_SECRET;
  const dataString = JSON.stringify({
    score: gameData.totalScore,
    time: gameData.completionTime,
    team: gameData.teamFinished,
    version: gameData.gameVersion
  });

  // 使用 Web Crypto API 生成 SHA-256
  return crypto.subtle.digest('SHA-256',
    new TextEncoder().encode(dataString + secret)
  );
}

// 遊戲過程記錄
class GameRecorder {
  constructor() {
    this.events = [];
    this.checkpoints = [];
  }

  recordEvent(type, data) {
    this.events.push({
      type,
      data,
      timestamp: Date.now(),
      gameTime: this.getGameTime()
    });
  }

  recordCheckpoint(distance) {
    this.checkpoints.push({
      distance,
      timestamp: Date.now(),
      teamStatus: this.getTeamStatus()
    });
  }

  generateReport() {
    return {
      events: this.events,
      checkpoints: this.checkpoints,
      summary: this.calculateSummary()
    };
  }
}
```

#### 服務端驗證（Cloud Functions）
```javascript
// functions/validateScore.js
exports.validateScore = functions.firestore
  .document('leaderboard/{docId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();

    // 驗證規則
    const validations = [
      checkScoreRange(data),
      checkTimeReasonable(data),
      checkTeamConsistency(data),
      checkChecksumValid(data),
      checkSessionUnique(data),
      checkAntiPattern(data)  // 檢測異常模式
    ];

    const results = await Promise.all(validations);
    const isValid = results.every(r => r.valid);

    // 更新驗證狀態
    await snap.ref.update({
      'metadata.isVerified': isValid,
      'metadata.verificationTime': admin.firestore.FieldValue.serverTimestamp(),
      'metadata.verificationDetails': results
    });

    // 如果無效，標記或移除
    if (!isValid) {
      await handleInvalidScore(snap.ref, results);
    }
  });
```

### 3.3 隱私保護

```javascript
// 敏感數據處理
const sanitizeUserData = (data) => {
  return {
    ...data,
    // 隱藏部分玩家名稱
    playerName: maskName(data.playerName),
    // 移除 IP 地址
    ipAddress: undefined,
    // 移除詳細位置信息
    location: data.location ? data.location.country : undefined
  };
};

// 名稱遮罩
const maskName = (name) => {
  if (!name || name.length <= 2) return '***';
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
};
```

---

## 四、UI/UX 設計

### 4.1 榮譽榜頁面結構

```jsx
// 頁面組件結構
<LeaderboardPage>
  {/* 頂部導航 */}
  <LeaderboardHeader>
    <TabNavigation>
      <Tab>總排行</Tab>
      <Tab>本週最佳</Tab>
      <Tab>速度榜</Tab>
      <Tab>團隊榜</Tab>
    </TabNavigation>
    <FilterOptions>
      <Select>全部時間 | 本週 | 本月</Select>
      <Select>全部路線 | 海線 | 山線</Select>
    </FilterOptions>
  </LeaderboardHeader>

  {/* 排行榜主體 */}
  <LeaderboardContent>
    {/* 前三名特殊展示 */}
    <TopThree>
      <Champion rank={1} />
      <Champion rank={2} />
      <Champion rank={3} />
    </TopThree>

    {/* 排行榜列表 */}
    <LeaderboardList>
      <LeaderboardItem rank={4} />
      <LeaderboardItem rank={5} />
      {/* ... */}
    </LeaderboardList>

    {/* 分頁 */}
    <Pagination />
  </LeaderboardContent>

  {/* 個人最佳記錄 */}
  <PersonalBest>
    <YourRank />
    <ComparisonChart />
  </PersonalBest>
</LeaderboardPage>
```

### 4.2 交互設計

#### 榮譽榜入口
1. **主頁入口**：明顯的「榮譽榜」按鈕
2. **結果頁入口**：完成遊戲後「查看排名」
3. **快速查看**：迷你排行榜 widget

#### 數據加載策略
```javascript
// 漸進式加載
const loadLeaderboard = async (page = 1, pageSize = 20) => {
  // 1. 先顯示緩存數據
  const cached = await getCachedLeaderboard();
  if (cached) setLeaderboard(cached);

  // 2. 加載最新數據
  setLoading(true);
  const fresh = await fetchLeaderboard(page, pageSize);

  // 3. 差異更新動畫
  animateUpdate(cached, fresh);
  setLeaderboard(fresh);

  // 4. 預加載下一頁
  prefetchNextPage(page + 1);
};
```

#### 實時更新
```javascript
// Firebase 實時監聽
useEffect(() => {
  const unsubscribe = firestore
    .collection('leaderboard')
    .orderBy('totalScore', 'desc')
    .limit(10)
    .onSnapshot((snapshot) => {
      const changes = snapshot.docChanges();

      changes.forEach((change) => {
        if (change.type === 'added') {
          // 新記錄動畫
          animateNewEntry(change.doc.data());
        } else if (change.type === 'modified') {
          // 排名變化動畫
          animateRankChange(change.doc.data());
        }
      });
    });

  return () => unsubscribe();
}, []);
```

### 4.3 視覺設計

```css
/* 排行榜樣式主題 */
.leaderboard-theme {
  /* 顏色方案 */
  --gold: #FFD700;
  --silver: #C0C0C0;
  --bronze: #CD7F32;
  --primary: #4A90E2;
  --secondary: #7B68EE;

  /* 排名顏色 */
  --rank-1: var(--gold);
  --rank-2: var(--silver);
  --rank-3: var(--bronze);
  --rank-top10: var(--primary);
  --rank-normal: #666;

  /* 動畫 */
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
}

/* 排名變化動畫 */
@keyframes rankUp {
  0% { transform: translateY(20px); opacity: 0; }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes newRecord {
  0% { transform: scale(0); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

---

## 五、實現步驟

### Phase 1：基礎建設（第 1 週）

#### Day 1-2：Firebase 設置
- [ ] 創建 Firebase 專案
- [ ] 安裝 Firebase SDK
- [ ] 配置環境變數
- [ ] 設置 Firestore 資料庫
- [ ] 配置安全規則

#### Day 3-4：數據層實現
- [ ] 創建 Firebase service 模組
- [ ] 實現數據提交功能
- [ ] 實現數據查詢功能
- [ ] 實現緩存機制
- [ ] 單元測試

#### Day 5-7：UI 開發
- [ ] 創建 Leaderboard 頁面
- [ ] 實現排行榜列表組件
- [ ] 實現篩選和排序功能
- [ ] 整合 GSAP 動畫
- [ ] 響應式設計

### Phase 2：功能完善（第 2 週）

#### Day 8-9：防作弊機制
- [ ] 實現客戶端校驗
- [ ] 部署 Cloud Functions
- [ ] 實現服務端驗證
- [ ] 異常檢測邏輯

#### Day 10-11：用戶體驗優化
- [ ] 實現實時更新
- [ ] 添加載入狀態
- [ ] 錯誤處理
- [ ] 離線支持
- [ ] 性能優化

#### Day 12-14：測試與部署
- [ ] 集成測試
- [ ] 性能測試
- [ ] 安全測試
- [ ] 部署到生產環境
- [ ] 監控設置

---

## 六、技術實現細節

### 6.1 Firebase 初始化

```javascript
// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 初始化服務
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

// 啟用離線持久化
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('離線持久化失敗：多個標籤頁開啟');
  } else if (err.code === 'unimplemented') {
    console.warn('離線持久化失敗：瀏覽器不支持');
  }
});
```

### 6.2 Leaderboard Service

```javascript
// src/services/leaderboardService.js
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

class LeaderboardService {
  constructor() {
    this.collectionName = 'leaderboard';
    this.cache = new Map();
    this.listeners = new Map();
  }

  // 提交分數
  async submitScore(scoreData) {
    try {
      // 數據驗證
      const validatedData = this.validateScoreData(scoreData);

      // 生成校驗和
      const checksum = await this.generateChecksum(validatedData);

      // 準備提交數據
      const submission = {
        ...validatedData,
        timestamp: serverTimestamp(),
        validation: {
          checksum,
          gameVersion: import.meta.env.VITE_GAME_VERSION,
          sessionId: this.generateSessionId(),
          platform: 'web',
          userAgent: navigator.userAgent
        },
        metadata: {
          isVerified: false,
          reportCount: 0,
          likeCount: 0,
          viewCount: 0
        }
      };

      // 提交到 Firestore
      const docRef = await addDoc(
        collection(db, this.collectionName),
        submission
      );

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('提交分數失敗:', error);
      return { success: false, error: error.message };
    }
  }

  // 獲取排行榜
  async getLeaderboard(options = {}) {
    const {
      orderByField = 'totalScore',
      orderDirection = 'desc',
      pageSize = 20,
      filters = {}
    } = options;

    // 檢查緩存
    const cacheKey = this.getCacheKey(options);
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 60000) { // 1分鐘緩存
        return cached.data;
      }
    }

    try {
      // 構建查詢
      let q = query(
        collection(db, this.collectionName),
        orderBy(orderByField, orderDirection),
        limit(pageSize)
      );

      // 添加過濾條件
      Object.entries(filters).forEach(([field, value]) => {
        q = query(q, where(field, '==', value));
      });

      // 執行查詢
      const snapshot = await getDocs(q);
      const leaderboard = [];

      snapshot.forEach((doc) => {
        leaderboard.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // 更新緩存
      this.cache.set(cacheKey, {
        data: leaderboard,
        timestamp: Date.now()
      });

      return leaderboard;
    } catch (error) {
      console.error('獲取排行榜失敗:', error);
      throw error;
    }
  }

  // 實時監聽排行榜
  subscribeToLeaderboard(callback, options = {}) {
    const {
      orderByField = 'totalScore',
      orderDirection = 'desc',
      pageSize = 10
    } = options;

    const q = query(
      collection(db, this.collectionName),
      orderBy(orderByField, orderDirection),
      limit(pageSize)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leaderboard = [];
      snapshot.forEach((doc) => {
        leaderboard.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(leaderboard);
    });

    // 存儲取消訂閱函數
    const listenerId = Date.now();
    this.listeners.set(listenerId, unsubscribe);

    return listenerId;
  }

  // 取消訂閱
  unsubscribe(listenerId) {
    if (this.listeners.has(listenerId)) {
      const unsubscribe = this.listeners.get(listenerId);
      unsubscribe();
      this.listeners.delete(listenerId);
    }
  }

  // 數據驗證
  validateScoreData(data) {
    const required = [
      'playerName',
      'totalScore',
      'completionTime',
      'gameData'
    ];

    required.forEach(field => {
      if (!data[field]) {
        throw new Error(`缺少必要欄位: ${field}`);
      }
    });

    // 驗證分數範圍
    if (data.totalScore < 0 || data.totalScore > 5000) {
      throw new Error('分數超出合理範圍');
    }

    // 驗證時間範圍
    if (data.completionTime < 25200 || data.completionTime > 86400) {
      throw new Error('完成時間不合理');
    }

    return data;
  }

  // 生成校驗和
  async generateChecksum(data) {
    const encoder = new TextEncoder();
    const dataString = JSON.stringify({
      score: data.totalScore,
      time: data.completionTime,
      team: data.gameData.teamFinished
    });

    const msgUint8 = encoder.encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
  }

  // 生成會話ID
  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // 生成緩存鍵
  getCacheKey(options) {
    return JSON.stringify(options);
  }
}

export default new LeaderboardService();
```

### 6.3 React Hook

```javascript
// src/hooks/useLeaderboard.js
import { useState, useEffect, useCallback } from 'react';
import leaderboardService from '../services/leaderboardService';

export function useLeaderboard(options = {}) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listenerId, setListenerId] = useState(null);

  // 載入排行榜
  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await leaderboardService.getLeaderboard(options);
      setLeaderboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [options]);

  // 訂閱實時更新
  const subscribeToUpdates = useCallback(() => {
    const id = leaderboardService.subscribeToLeaderboard(
      (data) => {
        setLeaderboard(data);
        setLoading(false);
      },
      options
    );
    setListenerId(id);
  }, [options]);

  // 提交分數
  const submitScore = useCallback(async (scoreData) => {
    const result = await leaderboardService.submitScore(scoreData);
    if (result.success) {
      await loadLeaderboard(); // 重新載入
    }
    return result;
  }, [loadLeaderboard]);

  // 初始化
  useEffect(() => {
    if (options.realtime) {
      subscribeToUpdates();
    } else {
      loadLeaderboard();
    }

    return () => {
      if (listenerId) {
        leaderboardService.unsubscribe(listenerId);
      }
    };
  }, []);

  return {
    leaderboard,
    loading,
    error,
    refresh: loadLeaderboard,
    submitScore
  };
}
```

---

## 七、風險評估與緩解

### 7.1 技術風險

| 風險項目 | 可能性 | 影響 | 緩解策略 |
|---------|--------|------|---------|
| Firebase 配額超限 | 中 | 高 | 實現緩存機制、優化查詢、設置配額警報 |
| 數據同步延遲 | 低 | 中 | 使用樂觀更新、顯示載入狀態 |
| 作弊行為氾濫 | 高 | 高 | 多層驗證、異常檢測、人工審核 |
| 瀏覽器兼容性 | 低 | 低 | Polyfills、漸進增強 |
| 網絡連接問題 | 中 | 中 | 離線緩存、重試機制、降級方案 |

### 7.2 安全風險

| 風險項目 | 可能性 | 影響 | 緩解策略 |
|---------|--------|------|---------|
| 數據篡改 | 高 | 高 | 服務端驗證、數據加密、審計日誌 |
| DDoS 攻擊 | 低 | 高 | Rate limiting、CDN、Cloud Armor |
| 數據洩露 | 低 | 高 | 最小權限原則、數據加密、定期審計 |
| 身份偽造 | 中 | 中 | 實現認證系統、設備指紋 |

### 7.3 業務風險

| 風險項目 | 可能性 | 影響 | 緩解策略 |
|---------|--------|------|---------|
| 用戶流失 | 中 | 高 | 優化加載速度、改善 UX、添加社交功能 |
| 成本超支 | 低 | 中 | 監控使用量、設置預算警報、優化架構 |
| 法規合規 | 低 | 高 | 隱私政策、GDPR 合規、數據本地化 |

---

## 八、監控與維護

### 8.1 性能監控

```javascript
// 性能指標追蹤
const trackLeaderboardPerformance = () => {
  // 載入時間
  performance.mark('leaderboard-load-start');
  // ... 載入邏輯
  performance.mark('leaderboard-load-end');
  performance.measure(
    'leaderboard-load-time',
    'leaderboard-load-start',
    'leaderboard-load-end'
  );

  // 發送到分析服務
  const measure = performance.getEntriesByName('leaderboard-load-time')[0];
  analytics.logEvent('performance_leaderboard', {
    load_time: measure.duration,
    entries_count: leaderboard.length
  });
};
```

### 8.2 錯誤監控

```javascript
// 錯誤邊界組件
class LeaderboardErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // 記錄錯誤
    console.error('Leaderboard Error:', error, errorInfo);

    // 發送到錯誤追蹤服務
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return <LeaderboardFallback />;
    }
    return this.props.children;
  }
}
```

### 8.3 數據分析

```javascript
// 用戶行為追蹤
const trackUserBehavior = {
  viewLeaderboard: (tab) => {
    analytics.logEvent('view_leaderboard', { tab });
  },

  filterLeaderboard: (filters) => {
    analytics.logEvent('filter_leaderboard', filters);
  },

  shareScore: (method) => {
    analytics.logEvent('share_score', { method });
  },

  compareWithFriend: (friendId) => {
    analytics.logEvent('compare_score', { friend_id: friendId });
  }
};
```

---

## 九、未來擴展計劃

### 9.1 短期優化（1-3 個月）

1. **匿名認證**
   - Firebase Anonymous Auth
   - 保存遊戲進度
   - 升級到完整賬戶

2. **社交功能**
   - 分享到社交媒體
   - 好友對戰
   - 留言評論

3. **數據視覺化**
   - 排名趨勢圖
   - 成績分析
   - 對比雷達圖

### 9.2 中期功能（3-6 個月）

1. **賽季系統**
   - 月度/季度賽季
   - 賽季獎勵
   - 歷史賽季查詢

2. **成就系統**
   - 成就徽章
   - 里程碑獎勵
   - 成就牆展示

3. **團隊功能**
   - 創建車隊
   - 團隊排行榜
   - 團隊挑戰賽

### 9.3 長期願景（6-12 個月）

1. **電競化**
   - 線上錦標賽
   - 直播功能
   - 觀戰系統

2. **數據開放**
   - 公開 API
   - 數據導出
   - 第三方整合

3. **AI 功能**
   - AI 對手
   - 智能推薦
   - 作弊檢測 AI

---

## 十、總結

### 核心價值
1. **競爭性**：激發玩家挑戰慾望
2. **公平性**：確保競爭環境公正
3. **社交性**：促進玩家互動交流
4. **持續性**：保持長期遊戲黏性

### 成功標準
- 日活躍用戶提升 30%
- 平均遊戲時長增加 20%
- 重玩率提升 40%
- 社交分享率達到 15%

### 關鍵里程碑
- Week 1：Firebase 整合完成
- Week 2：MVP 上線測試
- Week 4：正式發布
- Month 2：優化迭代
- Month 3：功能擴展

---

## 附錄

### A. 依賴安裝

```bash
# Firebase SDK
npm install firebase

# 可選：認證 UI
npm install firebaseui

# 可選：性能監控
npm install web-vitals
```

### B. 環境變數配置

```env
# .env.local
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_GAME_VERSION=0.0.1
VITE_GAME_SECRET=your_game_secret
```

### C. 參考資源

1. [Firebase Documentation](https://firebase.google.com/docs)
2. [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
3. [Firebase Security Rules](https://firebase.google.com/docs/rules)
4. [Web Vitals](https://web.dev/vitals/)
5. [GSAP ScrollTrigger](https://greensock.com/scrolltrigger/)

---

**文檔版本**: 1.0.0
**最後更新**: 2024-11-16
**作者**: Technical Project Manager
**狀態**: 待審核