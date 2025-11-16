# 一日北高挑戰 - 專案初始化文件

## FEATURE:

一款關於「一日北高」（台北到高雄騎車）的網頁策略遊戲，透過遊戲化方式教育玩家：
- **團隊陣容**的重要性與角色特性
- **破風隊伍**的策略與隊形運用
- **腳踏車零件**的選擇與搭配
- **事前準備**對長途騎行的影響

### 核心玩法
玩家需要在遊戲開始前：
1. 選擇團隊成員（4種角色類型：爬坡手、衝刺手、破風手、全能選手）
2. 安排破風隊形（單線、雙線、火車陣型）
3. 選擇和升級腳踏車零件（車架、輪組、變速系統等）
4. 進行事前準備（訓練計畫、補給策略、路線規劃）

然後開始挑戰，目標是在24小時內最快完成380公里的一日北高路線。

### 技術棧
- **Frontend**: React 18 + Vite 5
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS 3.4
- **Animation**: GSAP 3.12
- **Deployment**: GitHub Pages

---

## EXAMPLES:

此項目包含以下示例文件供參考：

### 文檔參考
- `docs/UI_UX_DESIGN_GUIDE.md` - 完整的 UI/UX 設計指南，包含色彩系統、組件設計、動畫規範等
- `PLANNING.md` - 詳細的專案規劃書，包含遊戲機制、技術架構、開發階段等
- `TASK.md` - 分階段任務清單，用於追蹤開發進度

### 組件示例
在 `src/components/` 文件夾中有以下示例組件：
- `CharacterCard.jsx` - 角色卡片組件（包含翻轉動畫、屬性顯示）
- `FormationEditor.jsx` - 隊形編排組件（拖放式介面）
- `GamePlay.jsx` - 遊戲進行畫面（即時狀態更新）

### 樣式配置
- `tailwind.config.js` - 自定義 Tailwind 配置（色彩、字體、動畫系統）
- `src/styles/globals.css` - 全域樣式和 CSS 變數

**注意**：這些示例是為本專案特別設計的，請根據實際需求進行調整和擴展。

---

## DOCUMENTATION:

### 官方文檔
- React 官方文檔: https://react.dev/
- Vite 文檔: https://vitejs.dev/
- Redux Toolkit 文檔: https://redux-toolkit.js.org/
- GSAP 文檔: https://greensock.com/docs/
- Tailwind CSS 文檔: https://tailwindcss.com/docs

### 部署文檔
- GitHub Pages 部署指南: https://docs.github.com/pages
- GitHub Actions 文檔: https://docs.github.com/actions
- 參考 `D:\claude mode\CLAUDE.md` 中的 CI/CD 部署指南

### 設計資源
- WCAG 2.1 無障礙標準: https://www.w3.org/WAI/WCAG21/quickref/
- Material Design 運動與動畫: https://m3.material.io/styles/motion/overview

---

## OTHER CONSIDERATIONS:

### 開發環境設置
- 使用 Node.js 18+ 和 npm/yarn
- 已配置 ESLint 和 Prettier 用於代碼品質控制
- 使用 Vitest + React Testing Library 進行測試

### 項目結構規範
- **組件模組化**：每個組件不超過 300 行代碼，複雜組件應拆分為子組件
- **狀態管理**：全局狀態使用 Redux Toolkit，局部狀態使用 React Hooks
- **樣式管理**：優先使用 Tailwind 工具類，複雜樣式使用 CSS modules 或 styled-components

### 性能考量
- 使用 React.memo、useMemo、useCallback 優化渲染性能
- GSAP 動畫使用 GPU 加速屬性（transform、opacity）
- 圖片資源使用 WebP 格式並實作懶加載
- 目標 Lighthouse 分數 > 90

### 遊戲平衡性
- 各角色、零件、策略應該平衡，沒有絕對優勢的選擇
- 測試各種組合確保遊戲可玩性和策略深度
- 收集玩家反饋進行迭代調整

### CI/CD 部署流程
- 參考 `D:\claude mode\CLAUDE.md` 中提到的 GitHub Pages 部署流程
- 先手動創建 `gh-pages` 分支，然後設置 CI/CD 自動更新
- 不要依賴完全自動化的初始部署

### 常見陷阱
- **GSAP 與 React**：確保在 useEffect 中正確清理動畫實例，避免記憶體洩漏
- **Redux 不可變性**：使用 Redux Toolkit 的 createSlice 自動處理不可變更新
- **Tailwind 生產優化**：確保 purge 配置正確，移除未使用的樣式
- **路由與 GitHub Pages**：使用 HashRouter 而非 BrowserRouter，避免 404 問題

### 無障礙設計
- 所有互動元素必須支援鍵盤導航
- 使用語義化 HTML 和適當的 ARIA 標籤
- 確保色彩對比度符合 WCAG AA 標準
- 提供文字替代方案給圖片和圖標

### 測試策略
- 單元測試：核心邏輯和工具函數
- 組件測試：UI 組件的渲染和互動
- 整合測試：Redux store 和組件的整合
- E2E 測試（可選）：完整的遊戲流程測試
