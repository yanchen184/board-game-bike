import { useState, useEffect, useCallback } from 'react';
import leaderboardService from '../services/leaderboardService';
import toast from 'react-hot-toast';

/**
 * 自定義 Hook - 管理排行榜數據和狀態
 * @param {string} type - 排行榜類型 (global, today, week, friends, personal)
 * @param {Object} options - 配置選項
 * @returns {Object} 排行榜數據和操作方法
 */
export const useLeaderboard = (type = 'global', options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 獲取排行榜數據
  const fetchData = useCallback(async (pageNum = page) => {
    try {
      setLoading(true);
      setError(null);

      const result = await leaderboardService.getLeaderboard(type, {
        ...options,
        page: pageNum,
        pageSize: options.pageSize || 20
      });

      if (pageNum === 1) {
        setData(result);
      } else {
        // 追加數據（無限滾動）
        setData(prev => ({
          ...result,
          entries: [...(prev?.entries || []), ...result.entries]
        }));
      }

      setHasMore(result.entries.length === (options.pageSize || 20));
      setPage(pageNum);
    } catch (err) {
      setError(err.message || '載入排行榜失敗');
      toast.error('無法載入排行榜數據');
    } finally {
      setLoading(false);
    }
  }, [type, options, page]);

  // 載入更多
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchData(page + 1);
    }
  }, [loading, hasMore, page, fetchData]);

  // 刷新數據
  const refresh = useCallback(() => {
    setPage(1);
    fetchData(1);
  }, [fetchData]);

  // 初始載入
  useEffect(() => {
    fetchData(1);
  }, [type, JSON.stringify(options.filter)]);

  // 自動刷新（今日榜）
  useEffect(() => {
    if (type === 'today') {
      const interval = setInterval(refresh, 30000); // 30秒刷新
      return () => clearInterval(interval);
    }
  }, [type, refresh]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    refetch: fetchData
  };
};

/**
 * 自定義 Hook - 管理用戶排名
 * @param {string} userId - 用戶ID
 * @returns {Object} 用戶排名信息
 */
export const useUserRank = (userId) => {
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchRank = async () => {
      try {
        setLoading(true);
        const result = await leaderboardService.getUserRank(userId);
        setRank(result);
      } catch (error) {
        console.error('Failed to fetch user rank:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRank();
  }, [userId]);

  return { rank, loading };
};

/**
 * 自定義 Hook - 管理排行榜統計
 * @returns {Object} 統計數據
 */
export const useLeaderboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const result = await leaderboardService.getStatistics();
        setStats(result);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // 定期更新統計
    const interval = setInterval(fetchStats, 60000); // 每分鐘更新
    return () => clearInterval(interval);
  }, []);

  return { stats, loading };
};

/**
 * 自定義 Hook - 管理個人記錄
 * @param {string} userId - 用戶ID
 * @returns {Object} 個人記錄數據
 */
export const usePersonalRecords = (userId) => {
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchRecords = async () => {
      try {
        setLoading(true);
        const result = await leaderboardService.getPersonalRecords(userId);
        setRecords(result);
      } catch (error) {
        console.error('Failed to fetch personal records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [userId]);

  return { records, loading };
};

/**
 * 自定義 Hook - 管理分數提交
 * @returns {Object} 提交方法和狀態
 */
export const useSubmitScore = () => {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const submitScore = useCallback(async (scoreData) => {
    try {
      setSubmitting(true);
      const submitResult = await leaderboardService.submitScore(scoreData);
      setResult(submitResult);

      // 顯示成功提示
      toast.success(
        `恭喜！你的全球排名：第 ${submitResult.rank} 名`,
        { duration: 5000 }
      );

      return submitResult;
    } catch (error) {
      console.error('Failed to submit score:', error);
      toast.error('提交成績失敗，請稍後再試');
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    submitScore,
    submitting,
    result
  };
};

/**
 * 自定義 Hook - 管理排名變化動畫
 * @param {Array} entries - 排行榜條目
 * @returns {Object} 動畫狀態
 */
export const useRankAnimation = (entries) => {
  const [animating, setAnimating] = useState(false);
  const [previousRanks, setPreviousRanks] = useState(new Map());

  useEffect(() => {
    if (!entries || entries.length === 0) return;

    const currentRanks = new Map(
      entries.map(entry => [entry.player.id, entry.rank])
    );

    // 檢測排名變化
    const hasChanges = Array.from(currentRanks.entries()).some(
      ([id, rank]) => previousRanks.get(id) !== rank
    );

    if (hasChanges && previousRanks.size > 0) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 1000);
    }

    setPreviousRanks(currentRanks);
  }, [entries]);

  return { animating, previousRanks };
};

/**
 * 自定義 Hook - 管理無限滾動
 * @param {Function} loadMore - 載入更多的回調函數
 * @param {boolean} hasMore - 是否還有更多數據
 * @returns {Object} 滾動參考和狀態
 */
export const useInfiniteScroll = (loadMore, hasMore) => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 100
        && hasMore
        && !isFetching
      ) {
        setIsFetching(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isFetching]);

  useEffect(() => {
    if (!isFetching) return;

    const fetchMoreData = async () => {
      await loadMore();
      setIsFetching(false);
    };

    fetchMoreData();
  }, [isFetching, loadMore]);

  return { isFetching };
};

export default useLeaderboard;