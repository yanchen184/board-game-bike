import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ArrowLeft,
  Filter,
  Users,
  Clock,
  Calendar,
  User,
  Globe,
  Award,
  Zap
} from 'lucide-react';

// 模擬資料
const mockLeaderboardData = {
  global: [
    {
      rank: 1,
      rankChange: 2,
      player: {
        id: 'user001',
        name: 'WindRider',
        avatar: '/api/placeholder/40/40',
        location: '台北市',
        level: 42
      },
      performance: {
        completionTime: '10:23:45',
        avgSpeed: 36.7,
        maxSpeed: 52.3
      },
      team: {
        composition: [
          { type: '破風手', count: 2 },
          { type: '爬坡手', count: 1 },
          { type: '衝刺手', count: 1 }
        ],
        teamwork: 92
      },
      route: {
        name: '山線挑戰',
        difficulty: '困難',
        elevation: 2845
      }
    },
    {
      rank: 2,
      rankChange: 0,
      player: {
        id: 'user002',
        name: 'TeamTaiwan',
        avatar: '/api/placeholder/40/40',
        location: '新竹市',
        level: 38
      },
      performance: {
        completionTime: '10:45:12',
        avgSpeed: 35.3,
        maxSpeed: 48.7
      },
      team: {
        composition: [
          { type: '全能型', count: 2 },
          { type: '耐力型', count: 2 }
        ],
        teamwork: 88
      },
      route: {
        name: '海線速攻',
        difficulty: '中等',
        elevation: 1523
      }
    },
    {
      rank: 3,
      rankChange: -1,
      player: {
        id: 'user003',
        name: 'CyclingMaster',
        avatar: '/api/placeholder/40/40',
        location: '台中市',
        level: 45
      },
      performance: {
        completionTime: '11:02:33',
        avgSpeed: 34.4,
        maxSpeed: 50.2
      },
      team: {
        composition: [
          { type: '破風手', count: 1 },
          { type: '爬坡手', count: 2 },
          { type: '輔助型', count: 1 }
        ],
        teamwork: 85
      },
      route: {
        name: '平衡路線',
        difficulty: '中等',
        elevation: 1876
      }
    }
  ],
  today: [],
  week: [],
  friends: [],
  personal: []
};

// 標籤配置
const TABS = [
  { id: 'global', label: '全球榜', icon: Globe },
  { id: 'today', label: '今日榜', icon: Clock, badge: 'LIVE' },
  { id: 'week', label: '本週榜', icon: Calendar },
  { id: 'friends', label: '好友榜', icon: Users },
  { id: 'personal', label: '個人紀錄', icon: User }
];

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('global');
  const [leaderboardData, setLeaderboardData] = useState(mockLeaderboardData);
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const containerRef = useRef(null);
  const currentUserId = 'user127'; // 模擬當前用戶

  // 頁面進入動畫
  useEffect(() => {
    const tl = gsap.timeline();

    tl.from('.page-header', {
      y: -50,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    })
    .from('.tab-button', {
      y: 20,
      opacity: 0,
      duration: 0.4,
      stagger: 0.08,
      ease: 'power3.out'
    }, '-=0.3')
    .from('.rank-card', {
      x: -100,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power3.out'
    }, '-=0.2');

    // 實時更新（今日榜）
    let interval;
    if (activeTab === 'today') {
      interval = setInterval(() => {
        // 模擬實時數據更新
        simulateLiveUpdate();
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab]);

  // 模擬實時更新
  const simulateLiveUpdate = () => {
    const cards = document.querySelectorAll('.rank-card');
    if (cards.length > 0) {
      const randomCard = cards[Math.floor(Math.random() * Math.min(3, cards.length))];
      gsap.to(randomCard, {
        backgroundColor: '#FEF3C7',
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    }
  };

  // 切換標籤
  const handleTabChange = (tabId) => {
    // 切換動畫
    gsap.to('.leaderboard-content', {
      opacity: 0,
      x: -30,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setActiveTab(tabId);
        gsap.fromTo('.leaderboard-content',
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
        );
      }
    });
  };

  // 展開/收合詳情
  const toggleExpand = (rankId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(rankId)) {
      newExpanded.delete(rankId);
    } else {
      newExpanded.add(rankId);
    }
    setExpandedItems(newExpanded);
  };

  // 獲取當前標籤數據
  const getCurrentData = () => {
    return leaderboardData[activeTab] || [];
  };

  // 渲染排名變化圖標
  const renderRankChange = (change) => {
    if (change > 0) {
      return (
        <div className="flex items-center gap-1 text-green-500">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-bold">{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center gap-1 text-red-500">
          <TrendingDown className="w-4 h-4" />
          <span className="text-sm font-bold">{Math.abs(change)}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-gray-400">
        <Minus className="w-4 h-4" />
      </div>
    );
  };

  // 渲染排名圖標
  const renderRankIcon = (rank) => {
    if (rank === 1) return <span className="text-4xl">🥇</span>;
    if (rank === 2) return <span className="text-4xl">🥈</span>;
    if (rank === 3) return <span className="text-4xl">🥉</span>;
    return <span className="text-2xl font-bold text-gray-700">#{rank}</span>;
  };

  // 空狀態組件
  const EmptyState = ({ type }) => {
    const messages = {
      global: {
        icon: '🌍',
        title: '成為第一個挑戰者！',
        desc: '目前還沒有任何玩家完成挑戰',
        action: '開始挑戰'
      },
      today: {
        icon: '📅',
        title: '今日尚無記錄',
        desc: '成為今天第一個完成挑戰的玩家',
        action: '立即開始'
      },
      friends: {
        icon: '👥',
        title: '邀請好友一起競賽',
        desc: '你的好友還沒有遊戲紀錄',
        action: '邀請好友'
      },
      personal: {
        icon: '🚴',
        title: '開始你的騎行之旅',
        desc: '完成第一次挑戰，創造你的紀錄',
        action: '開始遊戲'
      }
    };

    const config = messages[type] || messages.global;

    return (
      <div className="flex flex-col items-center justify-center py-20 px-8">
        <div className="text-6xl mb-4 animate-bounce">{config.icon}</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">{config.title}</h3>
        <p className="text-gray-600 text-center max-w-md mb-8">{config.desc}</p>
        <button
          onClick={() => navigate('/game')}
          className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-400
                     text-white font-bold rounded-lg shadow-lg
                     hover:shadow-xl transform hover:scale-105
                     transition-all duration-300"
        >
          {config.action}
        </button>
      </div>
    );
  };

  // 載入狀態組件
  const LoadingState = () => (
    <div className="space-y-4 p-6">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="animate-pulse">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const currentData = getCurrentData();

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {/* 頁首 */}
      <header className="page-header bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent flex items-center gap-2">
                <Trophy className="w-8 h-8 text-yellow-500" />
                騎行榮譽榜
              </h1>
            </div>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Filter className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </header>

      {/* 標籤切換 */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    tab-button flex items-center gap-2 px-4 py-2 rounded-lg font-semibold
                    whitespace-nowrap transition-all duration-300
                    ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-yellow-400 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-orange-500'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 主要內容區 */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 排行榜列表 */}
          <div className="lg:col-span-2">
            <div className="leaderboard-content">
              {loading ? (
                <LoadingState />
              ) : currentData.length === 0 ? (
                <EmptyState type={activeTab} />
              ) : (
                <div className="space-y-4">
                  {currentData.map((item, index) => {
                    const isExpanded = expandedItems.has(item.rank);
                    const isCurrentUser = item.player.id === currentUserId;

                    return (
                      <div
                        key={item.rank}
                        className={`
                          rank-card relative bg-white rounded-xl shadow-lg
                          transform transition-all duration-500 hover:shadow-xl hover:scale-102
                          ${isCurrentUser ? 'ring-4 ring-orange-400 bg-gradient-to-r from-orange-50 to-yellow-50' : ''}
                        `}
                      >
                        {/* 主要內容 */}
                        <div className="p-4 md:p-6">
                          <div className="flex items-center gap-4">
                            {/* 排名 */}
                            <div className="flex-shrink-0 text-center min-w-[60px]">
                              {renderRankIcon(item.rank)}
                              <div className="mt-1">
                                {renderRankChange(item.rankChange)}
                              </div>
                            </div>

                            {/* 玩家資訊 */}
                            <div className="flex-grow min-w-0">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.player.avatar}
                                  alt={item.player.name}
                                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-md flex-shrink-0"
                                />
                                <div className="min-w-0">
                                  <h3 className="text-base md:text-lg font-bold text-gray-800 flex items-center gap-2 flex-wrap">
                                    <span className="truncate">{item.player.name}</span>
                                    {isCurrentUser && (
                                      <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                                        YOU
                                      </span>
                                    )}
                                  </h3>
                                  <p className="text-sm text-gray-500">{item.player.location}</p>
                                </div>
                              </div>
                            </div>

                            {/* 成績 */}
                            <div className="text-right flex-shrink-0">
                              <div className="text-lg md:text-2xl font-bold text-orange-600">
                                {item.performance.completionTime}
                              </div>
                              <div className="text-xs md:text-sm text-gray-500">
                                {item.performance.avgSpeed} km/h
                              </div>
                            </div>

                            {/* 展開按鈕 */}
                            <button
                              onClick={() => toggleExpand(item.rank)}
                              className={`
                                p-2 rounded-lg hover:bg-gray-100 transition-all flex-shrink-0
                                ${isExpanded ? 'rotate-180' : ''}
                              `}
                            >
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            </button>
                          </div>
                        </div>

                        {/* 展開內容 */}
                        {isExpanded && (
                          <div className="border-t border-gray-100 p-4 md:p-6 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* 團隊配置 */}
                              <div>
                                <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  團隊配置
                                </h4>
                                <div className="space-y-2">
                                  {item.team.composition.map((member, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg">
                                      <span className="text-sm text-gray-600">{member.type}</span>
                                      <span className="text-sm font-bold text-orange-500">×{member.count}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* 路線資訊 */}
                              <div>
                                <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                                  <Zap className="w-4 h-4" />
                                  路線選擇
                                </h4>
                                <div className="bg-white p-3 rounded-lg space-y-2">
                                  <p className="text-sm font-semibold text-gray-700">{item.route.name}</p>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">難度</span>
                                    <span className={`
                                      px-2 py-1 rounded-full font-semibold
                                      ${item.route.difficulty === '困難' ? 'bg-red-100 text-red-600' :
                                        item.route.difficulty === '中等' ? 'bg-yellow-100 text-yellow-600' :
                                        'bg-green-100 text-green-600'}
                                    `}>
                                      {item.route.difficulty}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">總爬升</span>
                                    <span className="font-semibold">{item.route.elevation}m</span>
                                  </div>
                                </div>
                              </div>

                              {/* 表現指標 */}
                              <div>
                                <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                                  <Award className="w-4 h-4" />
                                  表現指標
                                </h4>
                                <div className="space-y-3">
                                  <div>
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className="text-gray-600">團隊協作</span>
                                      <span className="font-semibold">{item.team.teamwork}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full transition-all duration-1000"
                                        style={{ width: `${item.team.teamwork}%` }}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className="text-gray-600">最高速度</span>
                                      <span className="font-semibold">{item.performance.maxSpeed} km/h</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full transition-all duration-1000"
                                        style={{ width: `${(item.performance.maxSpeed / 60) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* 載入更多按鈕 */}
                  {currentData.length >= 10 && (
                    <button className="w-full py-4 bg-white rounded-xl shadow-lg hover:shadow-xl
                                     text-orange-500 font-semibold transition-all duration-300
                                     hover:bg-orange-50">
                      載入更多...
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 側邊欄 - 統計資訊 */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              {/* 個人最佳成績 */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  你的最佳成績
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">全球排名</span>
                    <span className="font-bold text-orange-500 text-xl">#127</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">最佳時間</span>
                    <span className="font-bold">13:45:30</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">平均速度</span>
                    <span className="font-bold">27.6 km/h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">完成次數</span>
                    <span className="font-bold">8 次</span>
                  </div>
                </div>
                <button className="w-full mt-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-400
                                 text-white font-bold rounded-lg shadow-md
                                 hover:shadow-lg transform hover:scale-105
                                 transition-all duration-300">
                  挑戰新紀錄
                </button>
              </div>

              {/* 快速統計 */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">排行榜統計</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">總參賽人數</span>
                    <span className="font-semibold">1,527</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">今日新紀錄</span>
                    <span className="font-semibold text-green-500">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">平均完成時間</span>
                    <span className="font-semibold">14:23:45</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">最熱門路線</span>
                    <span className="font-semibold">海線速攻</span>
                  </div>
                </div>
              </div>

              {/* 成就徽章 */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">最新成就</h3>
                <div className="grid grid-cols-3 gap-3">
                  {['🏆', '⚡', '🎯', '💪', '🌟', '🚀'].map((emoji, idx) => (
                    <div key={idx} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center
                                            hover:bg-orange-100 transition-colors cursor-pointer">
                      <span className="text-2xl">{emoji}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;