import { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import ErrorBoundary from './components/ErrorBoundary';
import Loading from './components/ui/Loading';

// 版本號
const APP_VERSION = '0.1.0';

// Lazy load pages for code splitting
const StartPage = lazy(() => import('./pages/StartPage'));
const SetupPage = lazy(() => import('./pages/SetupPage'));
const GamePage = lazy(() => import('./pages/GamePage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));

function App() {
  useEffect(() => {
    // 顯示版本號在 console
    console.log('%c🚴 一日北高挑戰 Taipei to Kaohsiung Challenge', 'font-size: 16px; font-weight: bold; color: #FF6B35;');
    console.log('%cVersion: ' + APP_VERSION, 'font-size: 14px; color: #4ECDC4;');
    console.log('%c✨ 新增功能: 新手教學系統 & UI 優化', 'font-size: 12px; color: #95E1D3;');
    console.log('%c📖 查看改進詳情: GAME_UX_IMPROVEMENTS.md', 'font-size: 12px; color: #95E1D3;');
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <HashRouter>
          <div className="app">
            <Suspense fallback={<Loading fullscreen message="載入頁面..." />}>
              <Routes>
                <Route path="/" element={<StartPage />} />
                <Route path="/setup" element={<SetupPage />} />
                <Route path="/game" element={<GamePage />} />
                <Route path="/results" element={<ResultsPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
              </Routes>
            </Suspense>

            {/* Toast notifications */}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </HashRouter>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
