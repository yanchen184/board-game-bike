# Claude 開發指南 - 一日北高挑戰遊戲

## 🔄 Project Awareness & Context
- **Always read `PLANNING.md`** at the start of a new conversation to understand the project's game mechanics, architecture, and design goals.
- **Always read `INITIAL.md`** to understand the feature scope, examples, documentation links, and important considerations.
- **Check `TASK.md`** before starting a new task. If the task isn't listed, add it with a brief description and today's date.
- **Review `docs/UI_UX_DESIGN_GUIDE.md`** when working on UI components to ensure consistency with the design system.
- **Use consistent naming conventions, file structure, and patterns** as described in `PLANNING.md`.

---

## 🧱 Code Structure & Modularity

### React 組件規範
- **Never create a component file longer than 300 lines of code.** If approaching this limit, refactor by:
  - Extracting sub-components
  - Moving logic to custom hooks
  - Separating business logic into service files
- **Organize components by feature**, not by type:
  ```
  src/components/
    ├── game/           # 遊戲核心組件
    ├── setup/          # 遊戲設置組件
    ├── results/        # 結果展示組件
    └── ui/             # 共用 UI 組件
  ```
- **Component structure**: Each complex feature should have:
  - `ComponentName.jsx` - Main component
  - `ComponentName.module.css` - Scoped styles (if needed, prefer Tailwind)
  - `ComponentName.test.jsx` - Component tests
  - `hooks/useComponentName.js` - Custom hooks (if complex logic exists)

### 檔案命名規範
- **組件**: PascalCase (e.g., `TeamBuilder.jsx`, `BikeCustomizer.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useGameState.js`, `useAnimation.js`)
- **工具函數**: camelCase (e.g., `calculations.js`, `helpers.js`)
- **常數**: UPPER_SNAKE_CASE in `constants.js`

### Import 規範
- **Import 順序**:
  1. React and third-party libraries
  2. Redux/state management
  3. Components
  4. Hooks
  5. Utils and constants
  6. Styles
- **使用絕對路徑** (configured in vite.config.js):
  ```javascript
  import Button from '@/components/ui/Button'
  import { useGameState } from '@/hooks/useGameState'
  import { GAME_PHASES } from '@/utils/constants'
  ```

---

## 🧪 Testing & Reliability

### React Testing Strategy
- **Always create tests for new components and hooks** using Vitest + React Testing Library
- **Tests should live in** `tests/` folder mirroring the `src/` structure
- **Test coverage requirements**:
  - UI Components: Rendering, user interactions, conditional rendering
  - Hooks: State changes, side effects, edge cases
  - Utils/Services: All functions with edge cases and error handling
  - Redux Slices: Actions, reducers, selectors

### Test Structure
Each test file should include at least:
- 1 test for expected behavior (happy path)
- 1 test for edge cases
- 1 test for error/failure scenarios

Example:
```javascript
// CharacterCard.test.jsx
describe('CharacterCard', () => {
  it('renders character information correctly', () => {
    // Happy path
  })

  it('handles missing optional props', () => {
    // Edge case
  })

  it('displays error state when data is invalid', () => {
    // Error case
  })
})
```

---

## ✅ Task Completion

- **Mark completed tasks in `TASK.md`** immediately after finishing them with completion date
- Add new sub-tasks discovered during development to `TASK.md` under the appropriate phase
- Update progress in the task's checkbox: `- [x] Task name (2024-11-16)`

---

## 📎 Style & Conventions

### React Best Practices
- **Use functional components** with React Hooks (no class components)
- **Prefer composition over inheritance**
- **Use PropTypes or TypeScript** for prop validation (this project uses PropTypes)
- **Destructure props** at the component level for clarity
- **Use meaningful component and variable names** that reflect purpose

### State Management Rules
- **Global State (Redux Toolkit)**:
  - Game state (phase, progress, events)
  - Team configuration
  - Bike configuration
  - Player profile and achievements
- **Local State (useState)**:
  - UI state (modals, tooltips, form inputs)
  - Temporary interaction state
- **Derived State**: Use selectors and `useMemo` instead of storing

### Tailwind CSS Guidelines
- **Prefer Tailwind utility classes** over custom CSS
- **Use the design system** defined in `tailwind.config.js`:
  - Colors: `primary-orange`, `primary-blue`, etc.
  - Spacing: Default Tailwind scale
  - Breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`
- **For complex/repeated styles**, create component classes in `globals.css`
- **Responsive design**: Mobile-first approach using Tailwind breakpoints

### GSAP Animation Guidelines
- **Always cleanup animations** in useEffect return function
- **Use GPU-accelerated properties**: `transform`, `opacity`, `scale`
- **Avoid animating**: `width`, `height`, `top`, `left` (use transforms instead)
- **Store timeline/animation refs** using `useRef`
- **Example pattern**:
  ```javascript
  useEffect(() => {
    const tl = gsap.timeline()
    tl.to(elementRef.current, { opacity: 1, duration: 0.5 })

    return () => tl.kill() // Cleanup
  }, [])
  ```

---

## 📚 Documentation & Code Quality

### Component Documentation
- **Add JSDoc comments** for complex components:
  ```javascript
  /**
   * TeamBuilder - 團隊選擇與配置組件
   *
   * @param {Object} props
   * @param {Function} props.onTeamChange - 團隊變更時的回調
   * @param {number} props.budget - 可用預算
   * @returns {JSX.Element}
   */
  ```

### Code Comments
- **Comment non-obvious logic**, especially:
  - Complex calculations (energy system, wind resistance)
  - Game mechanics (formation bonuses, event triggers)
  - Performance optimizations
- **Use inline `// Reason:` comments** to explain the "why", not the "what"

### README Updates
- **Update README.md** when:
  - New dependencies are added
  - Setup steps change
  - New features are complete
  - Deployment process changes

---

## 🧠 AI Behavior Rules

### General Guidelines
- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or packages** – only use verified npm packages
- **Always confirm file paths** exist before referencing them
- **Never delete or overwrite existing code** unless explicitly instructed or part of a task in `TASK.md`

### React-Specific Guidelines
- **Always check React version compatibility** (this project uses React 18)
- **Follow React 18 best practices** (automatic batching, Suspense, etc.)
- **Use recommended patterns** from official React docs
- **Avoid deprecated APIs** (e.g., no findDOMNode, no string refs)

### Game Development Considerations
- **Maintain game balance** - test any numerical changes thoroughly
- **Consider performance** - this is a real-time simulation game
- **Ensure consistent UX** - follow the design guide for all UI elements
- **Think about extensibility** - code should be easy to expand with new features

---

## 🎨 Design System Integration

### Using the Design System
- **Always reference** `docs/UI_UX_DESIGN_GUIDE.md` for:
  - Color palette and usage rules
  - Typography scale
  - Component patterns
  - Animation guidelines
  - Spacing and layout
- **Use design tokens** from `tailwind.config.js` and `globals.css`
- **Maintain visual consistency** across all components

### Accessibility (a11y)
- **All interactive elements must support keyboard navigation**
- **Use semantic HTML** (`<button>`, `<nav>`, `<main>`, etc.)
- **Add ARIA labels** for screen readers where needed
- **Ensure color contrast** meets WCAG AA standards
- **Test with keyboard only** - Tab, Enter, Space, Arrow keys

---

## 🚀 Performance Optimization

### React Performance
- **Use React.memo** for components that receive same props frequently
- **Use useMemo** for expensive calculations
- **Use useCallback** for functions passed as props
- **Avoid inline object/array creation** in render
- **Use lazy loading** for routes and heavy components

### GSAP Performance
- **Batch animations** using timelines
- **Use `will-change` sparingly** and only during animation
- **Prefer GSAP's `set()`** for instant property changes
- **Kill animations** when components unmount

### Asset Optimization
- **Use WebP format** for images
- **Implement lazy loading** for images below the fold
- **Optimize SVGs** - remove unnecessary data
- **Code split** by route using React.lazy()

---

## 🔧 Development Workflow

### Before Starting Work
1. Read `PLANNING.md` and `INITIAL.md`
2. Check `TASK.md` for current tasks
3. Pull latest changes from git
4. Ensure dependencies are up to date: `npm install`

### During Development
1. Follow the file structure in `PLANNING.md`
2. Write tests alongside features
3. Commit frequently with clear messages
4. Update `TASK.md` as you complete items

### Before Committing
1. Run tests: `npm test`
2. Run linter: `npm run lint`
3. Check build: `npm run build`
4. Preview production build: `npm run preview`
5. Update relevant documentation

---

## 📦 Deployment

### GitHub Pages Deployment
- **Reference**: See `D:\claude mode\CLAUDE.md` for detailed CI/CD guide
- **Process**:
  1. Manually create `gh-pages` branch first
  2. Set up GitHub Actions workflow
  3. Configure base path in `vite.config.js`
  4. Use HashRouter for routing compatibility
- **Build command**: `npm run build`
- **Output directory**: `dist/`

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] Build completes without errors
- [ ] Lighthouse score > 90
- [ ] No console errors or warnings
- [ ] Works on major browsers (Chrome, Firefox, Safari, Edge)
- [ ] Responsive on mobile, tablet, desktop
- [ ] Performance metrics acceptable

---

## 🎮 Game-Specific Guidelines

### Game Balance
- **Test all character combinations** to ensure no dominant strategy
- **Verify calculations** for energy, speed, wind resistance
- **Check random events** distribution and impact
- **Validate difficulty curve** - game should be challenging but achievable

### Data Management
- **Game constants** should be in `src/data/` files
- **Easy to modify** for balance adjustments
- **Well-commented** with explanations of values
- **Validated** with PropTypes or schemas

### User Experience
- **Provide clear feedback** for all player actions
- **Show loading states** for any async operations
- **Handle errors gracefully** with user-friendly messages
- **Save progress** automatically using localStorage
- **Tutorial mode** should be clear and non-intrusive

---

## 🐛 Common Pitfalls & Solutions

### GSAP + React
- **Problem**: Memory leaks from animations
- **Solution**: Always kill timelines/animations in useEffect cleanup
- **Problem**: Animations not working after re-render
- **Solution**: Use refs for DOM elements, not state

### Redux Toolkit
- **Problem**: State mutation errors
- **Solution**: Use createSlice which uses Immer for safe mutations
- **Problem**: Action not triggering re-render
- **Solution**: Ensure selector is properly memoized

### Tailwind CSS
- **Problem**: Styles not applying in production
- **Solution**: Check `content` array in `tailwind.config.js` includes all files
- **Problem**: Purge removing needed classes
- **Solution**: Add dynamic classes to safelist

### GitHub Pages
- **Problem**: 404 errors on routes
- **Solution**: Use HashRouter instead of BrowserRouter
- **Problem**: Assets not loading
- **Solution**: Configure correct base path in vite.config.js

---

## 📋 Checklist Template

### For New Components
- [ ] Component file created with proper naming
- [ ] PropTypes defined
- [ ] Responsive design implemented
- [ ] Accessibility features included
- [ ] Tests written and passing
- [ ] Follows design system
- [ ] GSAP animations cleaned up (if any)
- [ ] Performance optimized (memo/useMemo if needed)
- [ ] Documented in README (if public API)

### For New Features
- [ ] Added to TASK.md
- [ ] Planning documented
- [ ] Components implemented
- [ ] Redux state updated (if needed)
- [ ] Tests written
- [ ] UI/UX reviewed against design guide
- [ ] Performance tested
- [ ] Cross-browser tested
- [ ] Marked complete in TASK.md

---

## 📚 Quick Reference

### Project Commands
```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm test            # Run tests
npm run lint        # Run ESLint
npm run format      # Run Prettier
```

### Key Files
- `PLANNING.md` - Project architecture and game mechanics
- `INITIAL.md` - Feature scope and setup guide
- `TASK.md` - Task tracking
- `docs/UI_UX_DESIGN_GUIDE.md` - Design system
- `tailwind.config.js` - Design tokens
- `vite.config.js` - Build configuration

### Important Patterns
- State: Redux Toolkit for global, useState for local
- Styling: Tailwind utilities first, custom CSS as needed
- Animation: GSAP with proper cleanup
- Testing: Vitest + React Testing Library
- Routing: HashRouter for GitHub Pages compatibility
