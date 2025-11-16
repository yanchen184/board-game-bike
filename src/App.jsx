import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import ErrorBoundary from './components/ErrorBoundary';
import Loading from './components/ui/Loading';

// Lazy load pages for code splitting
const StartPage = lazy(() => import('./pages/StartPage'));
const SetupPage = lazy(() => import('./pages/SetupPage'));
const GamePage = lazy(() => import('./pages/GamePage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));

function App() {
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
