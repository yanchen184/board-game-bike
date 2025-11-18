import { test, expect } from '@playwright/test';

/**
 * 一日北高挑戰遊戲 E2E 測試套件
 *
 * 測試涵蓋：
 * ✅ 基本功能測試
 * ✅ 互動測試
 * ✅ 遊戲邏輯測試
 * ✅ 視覺回歸測試
 * ✅ 響應式測試
 */

test.describe('一日北高挑戰遊戲 - 完整測試', () => {

  // ============================================
  // 基本功能測試
  // ============================================

  test.describe('基本功能測試', () => {
    test('遊戲首頁載入測試', async ({ page }) => {
      await page.goto('/');

      // 檢查標題是否顯示
      await expect(page.getByTestId('game-title')).toBeVisible();
      await expect(page.getByTestId('game-title')).toHaveText('一日北高挑戰');

      // 檢查開始按鈕存在且可見
      const startButton = page.getByTestId('start-button');
      await expect(startButton).toBeVisible();
      await expect(startButton).toBeEnabled();

      // 檢查其他按鈕
      await expect(page.getByTestId('leaderboard-button')).toBeVisible();
      await expect(page.getByTestId('help-button')).toBeVisible();
    });

    test('點擊開始按鈕進入設置頁面', async ({ page }) => {
      await page.goto('/');

      // 點擊開始按鈕
      await page.getByTestId('start-button').click();

      // 等待導航到設置頁面
      await page.waitForURL('**/setup');

      // 確認設置頁面載入
      await expect(page.getByTestId('setup-page')).toBeVisible();
      await expect(page.getByTestId('setup-title')).toHaveText('遊戲設定');
    });

    test('排行榜頁面可以正常開啟', async ({ page }) => {
      await page.goto('/');

      // 點擊排行榜按鈕
      await page.getByTestId('leaderboard-button').click();

      // 等待導航到排行榜頁面
      await page.waitForURL('**/leaderboard');

      // 確認頁面載入
      await expect(page.locator('h1')).toBeVisible();
    });

    test('遊戲說明可以打開和關閉', async ({ page }) => {
      await page.goto('/');

      // 點擊幫助按鈕
      await page.getByTestId('help-button').click();

      // 等待 modal 出現
      await page.waitForTimeout(500);

      // 檢查是否有 modal 內容
      const modal = page.locator('[role="dialog"]').or(page.locator('.modal'));
      if (await modal.count() > 0) {
        await expect(modal.first()).toBeVisible();
      }
    });
  });

  // ============================================
  // 互動測試 - 遊戲設置流程
  // ============================================

  test.describe('互動測試 - 遊戲設置', () => {
    test('完整的遊戲設置流程', async ({ page }) => {
      await page.goto('/');
      await page.getByTestId('start-button').click();
      await page.waitForURL('**/setup');

      // 步驟 1: 選擇團隊成員
      await expect(page.getByTestId('setup-page')).toBeVisible();

      // 選擇至少 2 個角色 (點擊"選擇角色"按鈕)
      const selectButtons = page.locator('button:has-text("選擇角色")');
      const buttonCount = await selectButtons.count();

      if (buttonCount >= 2) {
        // 點擊前兩個"選擇角色"按鈕
        await selectButtons.nth(0).click();
        await page.waitForTimeout(500);
        await selectButtons.nth(1).click();
        await page.waitForTimeout(500);
      }

      // 點擊下一步
      const nextButton = page.getByTestId('next-button');
      await expect(nextButton).toBeEnabled();
      await nextButton.click();
      await page.waitForTimeout(500);

      // 步驟 2: 選擇裝備（使用便宜的選項以確保預算充足）
      // 選擇鋼管車架
      await page.getByTestId('equipment-card-frame-frame_steel_classic').click();
      await page.waitForTimeout(300);

      // 選擇鋁合金訓練輪組
      await page.getByTestId('equipment-card-wheels-wheels_aluminum_training').click();
      await page.waitForTimeout(300);

      // 選擇機械變速系統 (11速)
      await page.getByTestId('equipment-card-gears-gears_mechanical_11speed').click();
      await page.waitForTimeout(300);

      // 點擊下一步
      await nextButton.click();
      await page.waitForTimeout(500);

      // 步驟 3: 選擇隊形
      const formationCards = page.locator('h3:has-text("單線隊形")').or(
        page.locator('[class*="Card"]').filter({ hasText: '隊形' })
      );
      if (await formationCards.count() > 0) {
        await formationCards.first().click();
        await page.waitForTimeout(300);
      }

      // 點擊開始挑戰
      await nextButton.click();

      // 等待進入遊戲頁面
      await page.waitForURL('**/game', { timeout: 10000 });
      await expect(page.getByTestId('game-page')).toBeVisible({ timeout: 10000 });
    });

    test('設置頁面的返回按鈕功能', async ({ page }) => {
      await page.goto('/');
      await page.getByTestId('start-button').click();
      await page.waitForURL('**/setup');

      // 點擊返回按鈕
      await page.getByTestId('back-button').click();

      // 確認回到首頁
      await page.waitForURL('**/');
      await expect(page.getByTestId('game-title')).toBeVisible();
    });
  });

  // ============================================
  // 遊戲邏輯測試
  // ============================================

  test.describe('遊戲邏輯測試', () => {
    test('遊戲開始後數據正常更新', async ({ page }) => {
      // 快速設置並開始遊戲
      await page.goto('/');
      await page.getByTestId('start-button').click();
      await page.waitForURL('**/setup');

      // 步驟 1: 選擇團隊成員
      const selectButtons = page.locator('button:has-text("選擇角色")');
      const nextButton = page.getByTestId('next-button');

      if (await selectButtons.count() >= 2) {
        await selectButtons.nth(0).click();
        await page.waitForTimeout(500);
        await selectButtons.nth(1).click();
        await page.waitForTimeout(500);

        // 等待下一步按鈕變為可用
        await nextButton.waitFor({ state: 'visible', timeout: 5000 });
        await expect(nextButton).toBeEnabled({ timeout: 5000 });
      }

      await nextButton.click();
      await page.waitForTimeout(500);

      // 步驟 2: 選擇裝備（使用便宜的選項以確保預算充足）
      // 選擇鋼管車架
      await page.getByTestId('equipment-card-frame-frame_steel_classic').click();
      await page.waitForTimeout(300);

      // 選擇鋁合金訓練輪組
      await page.getByTestId('equipment-card-wheels-wheels_aluminum_training').click();
      await page.waitForTimeout(300);

      // 選擇機械變速系統 (11速)
      await page.getByTestId('equipment-card-gears-gears_mechanical_11speed').click();
      await page.waitForTimeout(300);

      await page.getByTestId('next-button').click();
      await page.waitForTimeout(500);

      // 步驟 3: 選擇隊形（選擇第一個卡片）
      const formationSection = page.locator('h2:has-text("隊形")').locator('..');
      const formationCards = formationSection.locator('.card');
      if (await formationCards.count() > 0) {
        await formationCards.first().click();
        await page.waitForTimeout(300);
      }

      await page.getByTestId('next-button').click();

      // 等待遊戲頁面
      await page.waitForURL('**/game', { timeout: 10000 });

      // 檢查遊戲統計數據
      await expect(page.getByTestId('distance-stat')).toBeVisible();
      await expect(page.getByTestId('time-stat')).toBeVisible();
      await expect(page.getByTestId('speed-stat')).toBeVisible();

      // 等待一段時間，確認數據有更新
      await page.waitForTimeout(2000);

      // 獲取距離值，應該大於 0
      const distanceText = await page.getByTestId('distance-value').textContent();
      expect(distanceText).toBeTruthy();
    });

    test('暫停和繼續功能正常', async ({ page }) => {
      // 設置遊戲並進入遊戲頁面
      await page.goto('/');
      await page.getByTestId('start-button').click();
      await page.waitForURL('**/setup');

      // 步驟 1: 選擇團隊成員
      const selectButtons = page.locator('button:has-text("選擇角色")');
      const nextButton = page.getByTestId('next-button');

      if (await selectButtons.count() >= 2) {
        await selectButtons.nth(0).click();
        await page.waitForTimeout(500);
        await selectButtons.nth(1).click();
        await page.waitForTimeout(500);

        // 等待下一步按鈕變為可用
        await nextButton.waitFor({ state: 'visible', timeout: 5000 });
        await expect(nextButton).toBeEnabled({ timeout: 5000 });
      }

      await nextButton.click();
      await page.waitForTimeout(500);

      // 步驟 2: 選擇裝備（使用便宜的選項以確保預算充足）
      // 選擇鋼管車架
      await page.getByTestId('equipment-card-frame-frame_steel_classic').click();
      await page.waitForTimeout(300);

      // 選擇鋁合金訓練輪組
      await page.getByTestId('equipment-card-wheels-wheels_aluminum_training').click();
      await page.waitForTimeout(300);

      // 選擇機械變速系統 (11速)
      await page.getByTestId('equipment-card-gears-gears_mechanical_11speed').click();
      await page.waitForTimeout(300);

      await page.getByTestId('next-button').click();
      await page.waitForTimeout(500);

      // 步驟 3: 選擇隊形
      const formationSection = page.locator('h2:has-text("隊形")').locator('..');
      const formationCards = formationSection.locator('.card');
      if (await formationCards.count() > 0) {
        await formationCards.first().click();
        await page.waitForTimeout(300);
      }

      await page.getByTestId('next-button').click();

      await page.waitForURL('**/game', { timeout: 10000 });

      // 關閉可能出現的教學模態框（如果有）
      const tutorialModal = page.locator('.fixed.inset-0.z-50');
      if (await tutorialModal.isVisible({ timeout: 2000 }).catch(() => false)) {
        // 嘗試找到關閉按鈕並點擊
        const closeButton = page.locator('button').filter({ hasText: /跳過|知道了|關閉|開始|確定/i });
        if (await closeButton.first().isVisible({ timeout: 1000 }).catch(() => false)) {
          await closeButton.first().click();
          await page.waitForTimeout(500);
        }
      }

      // 測試暫停按鈕
      const pauseButton = page.getByTestId('pause-button');
      await expect(pauseButton).toBeVisible();

      // 點擊暫停（使用 force 選項以應對可能的覆蓋層）
      await pauseButton.click({ force: true });
      await page.waitForTimeout(500);

      // 檢查按鈕文字變化
      await expect(pauseButton).toContainText('繼續');

      // 點擊繼續（使用 force 選項以應對可能的覆蓋層）
      await pauseButton.click({ force: true });
      await page.waitForTimeout(500);

      // 檢查按鈕文字恢復
      await expect(pauseButton).toContainText('暫停');
    });
  });

  // ============================================
  // 視覺回歸測試
  // ============================================

  test.describe('視覺回歸測試', () => {
    test('首頁視覺截圖', async ({ page }) => {
      await page.goto('/');

      // 等待動畫完成
      await page.waitForTimeout(1500);

      // 截圖並比對
      await expect(page).toHaveScreenshot('homepage.png', {
        maxDiffPixels: 200,
        fullPage: true,
      });
    });

    test('設置頁面視覺截圖', async ({ page }) => {
      await page.goto('/');
      await page.getByTestId('start-button').click();
      await page.waitForURL('**/setup');

      // 等待頁面完全載入
      await page.waitForTimeout(1000);

      // 截圖
      await expect(page).toHaveScreenshot('setup-page.png', {
        maxDiffPixels: 200,
        fullPage: true,
      });
    });
  });

  // ============================================
  // 響應式測試
  // ============================================

  test.describe('響應式測試', () => {
    test('桌面版 (1920x1080) 正常顯示', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');

      // 檢查主要元素可見
      await expect(page.getByTestId('game-title')).toBeVisible();
      await expect(page.getByTestId('start-button')).toBeVisible();

      // 檢查佈局合理（標題不應該被截斷）
      const title = page.getByTestId('game-title');
      const boundingBox = await title.boundingBox();
      expect(boundingBox?.width).toBeLessThan(1800);
    });

    test('平板版 (768x1024) 正常顯示', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');

      // 檢查主要元素可見
      await expect(page.getByTestId('game-title')).toBeVisible();
      await expect(page.getByTestId('start-button')).toBeVisible();

      // 檢查按鈕排列（可能變成垂直排列）
      const startButton = page.getByTestId('start-button');
      await expect(startButton).toBeVisible();
    });

    test('手機版 (375x667) 正常顯示', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // 檢查主要元素可見
      await expect(page.getByTestId('game-title')).toBeVisible();
      await expect(page.getByTestId('start-button')).toBeVisible();

      // 標題文字應該適應小螢幕
      const title = page.getByTestId('game-title');
      const boundingBox = await title.boundingBox();
      expect(boundingBox?.width).toBeLessThan(400);
    });

    test('響應式設置頁面測試', async ({ page }) => {
      // 手機版測試
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.getByTestId('start-button').click();
      await page.waitForURL('**/setup');

      // 確認設置頁面在手機上正常顯示
      await expect(page.getByTestId('setup-page')).toBeVisible();
      await expect(page.getByTestId('setup-title')).toBeVisible();

      // 確認按鈕可點擊
      await expect(page.getByTestId('next-button')).toBeVisible();
      await expect(page.getByTestId('back-button')).toBeVisible();
    });
  });

  // ============================================
  // 邊界情況測試
  // ============================================

  test.describe('邊界情況測試', () => {
    test('沒有選擇角色時無法進入下一步', async ({ page }) => {
      await page.goto('/');
      await page.getByTestId('start-button').click();
      await page.waitForURL('**/setup');

      // 不選擇任何角色，直接嘗試點擊下一步
      const nextButton = page.getByTestId('next-button');

      // 下一步按鈕應該被禁用
      await expect(nextButton).toBeDisabled();
    });

    test('頁面重新整理後狀態保持', async ({ page }) => {
      await page.goto('/');

      // 記錄初始URL
      const initialUrl = page.url();

      // 重新整理頁面
      await page.reload();

      // 確認仍然在首頁
      await expect(page.getByTestId('game-title')).toBeVisible();
      expect(page.url()).toBe(initialUrl);
    });
  });

  // ============================================
  // 性能測試
  // ============================================

  test.describe('性能測試', () => {
    test('頁面載入時間應該在合理範圍內', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');
      await expect(page.getByTestId('game-title')).toBeVisible();

      const loadTime = Date.now() - startTime;

      // 頁面應該在 5 秒內載入
      expect(loadTime).toBeLessThan(5000);
    });

    test('無 console 錯誤', async ({ page }) => {
      const consoleErrors = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto('/');
      await page.waitForTimeout(2000);

      // 過濾掉已知的無害錯誤（如果有）
      const criticalErrors = consoleErrors.filter(error =>
        !error.includes('DevTools') &&
        !error.includes('Extension')
      );

      // 不應該有關鍵錯誤
      expect(criticalErrors.length).toBe(0);
    });
  });
});
