import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 測試配置
 * 用於一日北高挑戰遊戲的端到端測試
 */
export default defineConfig({
  testDir: './e2e',

  /* 完全並行執行測試以提高速度 */
  fullyParallel: true,

  /* CI 環境下測試失敗時不重試，本地開發時不重試 */
  forbidOnly: !!process.env.CI,

  /* CI 環境下不重試，本地開發時也不重試 */
  retries: process.env.CI ? 2 : 0,

  /* CI 環境下使用更少的 workers */
  workers: process.env.CI ? 1 : undefined,

  /* 測試報告器 */
  reporter: [
    ['html'],
    ['list']
  ],

  /* 共享設置 */
  use: {
    /* 基礎 URL */
    baseURL: 'http://localhost:5174',

    /* 測試失敗時截圖 */
    screenshot: 'only-on-failure',

    /* 測試失敗時保留影片 */
    video: 'retain-on-failure',

    /* 測試追蹤 */
    trace: 'on-first-retry',
  },

  /* 配置開發伺服器 */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  /* 配置測試項目 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    /* 手機測試 */
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },

    /* 平板測試 */
    {
      name: 'tablet',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
      },
    },
  ],
});
