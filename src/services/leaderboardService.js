// 排行榜服務模組
// 管理排行榜數據的存取、更新和同步

const STORAGE_KEY = 'bikeChallenge_leaderboard';
const PERSONAL_RECORDS_KEY = 'bikeChallenge_personalRecords';

// 模擬排行榜數據
const generateMockData = (count = 50) => {
  const names = [
    'WindRider', 'TeamTaiwan', 'CyclingMaster', 'SpeedDemon', 'MountainKing',
    'RoadWarrior', 'PedalPower', 'BikeNinja', 'WheelMaster', 'ChainBreaker',
    '破風王', '單車俠', '追風少年', '鐵馬勇士', '公路戰將'
  ];

  const locations = [
    '台北市', '新北市', '桃園市', '新竹市', '台中市',
    '彰化縣', '雲林縣', '嘉義市', '台南市', '高雄市'
  ];

  const teamTypes = ['破風手', '爬坡手', '衝刺手', '耐力型', '全能型', '輔助型'];
  const routes = ['山線挑戰', '海線速攻', '平衡路線', '極限路線'];
  const difficulties = ['簡單', '中等', '困難', '極限'];

  const data = [];
  for (let i = 0; i < count; i++) {
    const hours = 10 + Math.floor(Math.random() * 6);
    const minutes = Math.floor(Math.random() * 60);
    const seconds = Math.floor(Math.random() * 60);

    data.push({
      rank: i + 1,
      rankChange: Math.floor(Math.random() * 11) - 5,
      player: {
        id: `user${String(i + 1).padStart(3, '0')}`,
        name: names[Math.floor(Math.random() * names.length)] + (i + 1),
        avatar: `/api/placeholder/40/40`,
        location: locations[Math.floor(Math.random() * locations.length)],
        level: Math.floor(Math.random() * 50) + 1
      },
      performance: {
        completionTime: `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
        avgSpeed: (30 + Math.random() * 10).toFixed(1),
        maxSpeed: (45 + Math.random() * 15).toFixed(1),
        totalDistance: 380,
        restStops: Math.floor(Math.random() * 5) + 1
      },
      team: {
        composition: generateTeamComposition(),
        teamwork: Math.floor(Math.random() * 30) + 70,
        strategy: ['aggressive', 'balanced', 'conservative'][Math.floor(Math.random() * 3)]
      },
      route: {
        name: routes[Math.floor(Math.random() * routes.length)],
        difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
        elevation: Math.floor(Math.random() * 2000) + 1000,
        scenic: Math.floor(Math.random() * 30) + 70
      },
      equipment: {
        bike: `Bike Model ${i + 1}`,
        totalWeight: (6 + Math.random() * 4).toFixed(1),
        aeroDrag: (0.2 + Math.random() * 0.1).toFixed(2)
      },
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return data;
};

// 生成團隊配置
const generateTeamComposition = () => {
  const types = ['破風手', '爬坡手', '衝刺手', '耐力型', '全能型', '輔助型'];
  const composition = [];
  let remaining = 4;

  while (remaining > 0) {
    const type = types[Math.floor(Math.random() * types.length)];
    const count = Math.min(Math.floor(Math.random() * 2) + 1, remaining);

    const existing = composition.find(c => c.type === type);
    if (existing) {
      existing.count += count;
    } else {
      composition.push({ type, count });
    }

    remaining -= count;
  }

  return composition;
};

class LeaderboardService {
  constructor() {
    this.cache = new Map();
    this.lastUpdate = null;
    this.updateInterval = 30000; // 30秒更新間隔
  }

  // 獲取排行榜數據
  async getLeaderboard(type = 'global', options = {}) {
    const {
      page = 1,
      pageSize = 20,
      filter = {}
    } = options;

    // 檢查緩存
    const cacheKey = `${type}_${JSON.stringify(options)}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.updateInterval) {
        return cached.data;
      }
    }

    // 模擬API請求延遲
    await new Promise(resolve => setTimeout(resolve, 300));

    // 生成或獲取數據
    let data = this.loadFromStorage(type) || generateMockData();

    // 應用篩選
    if (filter.route) {
      data = data.filter(item => item.route.name === filter.route);
    }
    if (filter.difficulty) {
      data = data.filter(item => item.route.difficulty === filter.difficulty);
    }

    // 分頁
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = data.slice(startIndex, endIndex);

    const result = {
      entries: paginatedData,
      metadata: {
        total: data.length,
        page,
        pageSize,
        totalPages: Math.ceil(data.length / pageSize),
        lastUpdated: new Date().toISOString()
      }
    };

    // 更新緩存
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  }

  // 獲取用戶排名
  async getUserRank(userId) {
    const globalData = await this.getLeaderboard('global', { pageSize: 1000 });
    const userEntry = globalData.entries.find(entry => entry.player.id === userId);

    if (!userEntry) {
      return null;
    }

    return {
      rank: userEntry.rank,
      percentile: Math.round((1 - userEntry.rank / globalData.metadata.total) * 100),
      nearbyEntries: globalData.entries.slice(
        Math.max(0, userEntry.rank - 3),
        userEntry.rank + 2
      )
    };
  }

  // 提交新成績
  async submitScore(scoreData) {
    const {
      userId,
      playerName,
      completionTime,
      team,
      route,
      equipment,
      performance
    } = scoreData;

    // 生成新的排行榜條目
    const newEntry = {
      player: {
        id: userId,
        name: playerName,
        avatar: '/api/placeholder/40/40',
        location: '台灣',
        level: 1
      },
      performance,
      team,
      route,
      equipment,
      timestamp: new Date().toISOString()
    };

    // 更新全球榜
    const globalData = this.loadFromStorage('global') || [];
    globalData.push(newEntry);

    // 重新排序
    globalData.sort((a, b) => {
      const timeA = this.parseTime(a.performance.completionTime);
      const timeB = this.parseTime(b.performance.completionTime);
      return timeA - timeB;
    });

    // 更新排名
    globalData.forEach((entry, index) => {
      entry.rank = index + 1;
      entry.rankChange = 0; // 新提交的默認無變化
    });

    // 保存到存儲
    this.saveToStorage('global', globalData);

    // 更新個人記錄
    this.updatePersonalRecords(userId, newEntry);

    // 清除緩存
    this.cache.clear();

    // 返回新排名
    const userRank = globalData.findIndex(e => e.player.id === userId) + 1;
    return {
      rank: userRank,
      totalPlayers: globalData.length,
      improvement: null // 可以計算相對於之前的進步
    };
  }

  // 獲取統計數據
  async getStatistics() {
    const globalData = await this.getLeaderboard('global', { pageSize: 1000 });
    const entries = globalData.entries;

    if (entries.length === 0) {
      return {
        totalPlayers: 0,
        averageTime: '--:--:--',
        fastestTime: '--:--:--',
        mostPopularRoute: '-',
        mostPopularTeam: '-',
        todayRecords: 0
      };
    }

    // 計算平均時間
    const times = entries.map(e => this.parseTime(e.performance.completionTime));
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

    // 統計路線
    const routeCounts = {};
    entries.forEach(e => {
      routeCounts[e.route.name] = (routeCounts[e.route.name] || 0) + 1;
    });
    const mostPopularRoute = Object.entries(routeCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    // 統計今日記錄
    const today = new Date().toDateString();
    const todayRecords = entries.filter(e =>
      new Date(e.timestamp).toDateString() === today
    ).length;

    return {
      totalPlayers: entries.length,
      averageTime: this.formatTime(avgTime),
      fastestTime: entries[0]?.performance.completionTime || '--:--:--',
      mostPopularRoute,
      todayRecords,
      recentActivity: this.getRecentActivity(entries)
    };
  }

  // 獲取最近活動
  getRecentActivity(entries) {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    return {
      last24h: entries.filter(e =>
        now - new Date(e.timestamp).getTime() < dayMs
      ).length,
      last7days: entries.filter(e =>
        now - new Date(e.timestamp).getTime() < 7 * dayMs
      ).length,
      last30days: entries.filter(e =>
        now - new Date(e.timestamp).getTime() < 30 * dayMs
      ).length
    };
  }

  // 解析時間字符串為秒數
  parseTime(timeStr) {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }

  // 格式化秒數為時間字符串
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // 從本地存儲加載
  loadFromStorage(type) {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${type}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load leaderboard from storage:', error);
      return null;
    }
  }

  // 保存到本地存儲
  saveToStorage(type, data) {
    try {
      localStorage.setItem(`${STORAGE_KEY}_${type}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save leaderboard to storage:', error);
    }
  }

  // 更新個人記錄
  updatePersonalRecords(userId, newEntry) {
    try {
      const records = JSON.parse(localStorage.getItem(PERSONAL_RECORDS_KEY) || '{}');

      if (!records[userId]) {
        records[userId] = {
          best: newEntry,
          history: []
        };
      }

      records[userId].history.push(newEntry);

      // 更新最佳記錄
      const currentBestTime = this.parseTime(records[userId].best.performance.completionTime);
      const newTime = this.parseTime(newEntry.performance.completionTime);

      if (newTime < currentBestTime) {
        records[userId].best = newEntry;
      }

      localStorage.setItem(PERSONAL_RECORDS_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Failed to update personal records:', error);
    }
  }

  // 獲取個人記錄
  async getPersonalRecords(userId) {
    try {
      const records = JSON.parse(localStorage.getItem(PERSONAL_RECORDS_KEY) || '{}');
      return records[userId] || null;
    } catch (error) {
      console.error('Failed to load personal records:', error);
      return null;
    }
  }

  // 清除所有數據（用於測試）
  clearAllData() {
    localStorage.removeItem(`${STORAGE_KEY}_global`);
    localStorage.removeItem(`${STORAGE_KEY}_today`);
    localStorage.removeItem(`${STORAGE_KEY}_week`);
    localStorage.removeItem(`${STORAGE_KEY}_friends`);
    localStorage.removeItem(PERSONAL_RECORDS_KEY);
    this.cache.clear();
  }
}

// 創建單例實例
const leaderboardService = new LeaderboardService();

export default leaderboardService;

// 導出便利函數
export const {
  getLeaderboard,
  getUserRank,
  submitScore,
  getStatistics,
  getPersonalRecords,
  clearAllData
} = leaderboardService;