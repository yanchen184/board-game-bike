name: "一日北高挑戰 - React 遊戲 MVP 實作"
description: |
  Complete implementation of a cycling strategy game from initialization to deployment.
  This PRP guides the creation of a React web game where players manage a cycling team
  to complete the Taipei-to-Kaohsiung challenge with strategic planning.

---

## Goal
Build a fully functional MVP of the "一日北高挑戰" cycling strategy game using React + Vite, featuring:
- Team selection system with 4 character types
- Bike customization with parts affecting performance
- Race simulation with real-time progress tracking
- Formation management affecting wind resistance and stamina
- Event system (weather, mechanical failures, supply stations)
- Results screen with scoring and achievements
- Deployment to GitHub Pages

**End State**: A playable web game accessible via GitHub Pages where users can strategize team composition, customize bikes, and race to complete the 380km Taipei-to-Kaohsiung challenge.

---

## Why
- **Educational Value**: Teaches the importance of team coordination, equipment selection, and preparation in long-distance cycling
- **User Impact**: Engaging gamification of cycling culture, making strategy concepts accessible
- **Technical Demonstration**: Showcases React 18 patterns, Redux Toolkit state management, GSAP animations, and responsive design

---

## What
A single-page application with the following user flow:

1. **Start Screen**: Game title, play button, instructions
2. **Setup Phase**:
   - Character Selection: Choose team members (4 roles: Climber, Sprinter, Domestique, All-Rounder)
   - Bike Configuration: Select frame, wheels, gears within budget
   - Formation Planning: Arrange team formation (Single Line, Double Line, Train)
   - Preparation: Training plan, supply strategy, route selection
3. **Racing Phase**:
   - Real-time simulation showing team progress along 380km route
   - Dynamic stats: distance, speed, stamina, morale
   - Random events requiring strategic decisions
   - Formation rotation to manage fatigue
4. **Results Screen**:
   - Completion time, score calculation
   - Achievement unlocks
   - Replay and share options

### Success Criteria
- [ ] Project initializes and builds without errors
- [ ] All 4 game phases functional (Start → Setup → Racing → Results)
- [ ] Redux state management working across all components
- [ ] GSAP animations smooth (60fps) on desktop and mobile
- [ ] Responsive design works on mobile (375px), tablet (768px), desktop (1440px)
- [ ] Game mechanics balanced (testing shows 20-40% win rate)
- [ ] Deployed successfully to GitHub Pages
- [ ] Lighthouse score > 85 (Performance, Accessibility, Best Practices)
- [ ] No console errors or warnings in production build

---

## All Needed Context

### Documentation & References
```yaml
# CRITICAL: Read these first before implementation
- url: https://react.dev/learn
  why: React 18 fundamentals, hooks patterns, component composition
  critical: UseEffect cleanup for GSAP animations to prevent memory leaks

- url: https://vitejs.dev/guide/
  why: Vite configuration, build optimization, asset handling
  critical: base path configuration for GitHub Pages deployment

- url: https://redux-toolkit.js.org/tutorials/quick-start
  why: Store setup, slice creation, selector patterns
  critical: Use createSlice for immutable updates via Immer

- url: https://greensock.com/docs/v3/GSAP
  why: Animation timeline management, easing functions
  critical: Always kill() animations in useEffect cleanup
  section: "React integration" - https://greensock.com/react/

- url: https://tailwindcss.com/docs/installation/framework-guides#vite
  why: Vite + Tailwind setup, configuration
  critical: Content array must include all JSX files for purging

- url: https://react-redux.js.org/tutorials/quick-start
  why: useSelector, useDispatch hooks, performance optimization

- url: https://github.com/floating-ui/react-popovers
  why: Tooltip positioning for character stats (if needed)

# MUST MIRROR - Existing code patterns
- file: src/components/CharacterCard.jsx
  why: Component structure, GSAP animation pattern, prop handling
  critical: |
    - Use useRef for DOM elements to animate
    - Cleanup animations in useEffect return
    - PropTypes for validation (not TypeScript)
    - Tailwind classes from design system

- file: tailwind.config.js
  why: Custom color palette, animations, component classes to use
  critical: |
    - Use primary-orange, primary-blue, primary-green for actions
    - Use gradient-sunset, gradient-sky for backgrounds
    - Use btn-primary, btn-secondary component classes
    - Custom animations: fade-in, slide-up, scale-up

- file: src/styles/globals.css
  why: CSS variables, base styles, font imports
  critical: Fonts already imported, use var(--color-*) if needed

- docfile: PLANNING.md
  why: Complete game mechanics, data structures, MVP feature scope
  critical: |
    - Character attributes defined (speed, stamina, teamwork)
    - Formation bonuses (single: 20%, double: 15%, train: 25%)
    - Budget system for bike parts
    - Scoring algorithm

- docfile: docs/UI_UX_DESIGN_GUIDE.md
  why: Visual style, component patterns, animation guidelines, accessibility
  critical: Follow color usage rules, typography scale, responsive breakpoints

- docfile: CLAUDE.md
  why: Project conventions, testing requirements, deployment process
  critical: |
    - Max 300 lines per component
    - Test coverage required
    - HashRouter for GitHub Pages
    - Performance optimization patterns
```

### Current Codebase Tree
```bash
board-game-bike/
├── .claude/
├── docs/
│   └── UI_UX_DESIGN_GUIDE.md    # Complete design system
├── src/
│   ├── components/
│   │   ├── CharacterCard.jsx     # REFERENCE: Component pattern
│   │   ├── FormationEditor.jsx   # REFERENCE: Drag-drop pattern
│   │   └── GamePlay.jsx          # REFERENCE: Game screen layout
│   └── styles/
│       └── globals.css           # Global styles, CSS vars
├── PRPs/
│   └── templates/
├── PLANNING.md                   # Game design document
├── INITIAL.md                    # Feature requirements
├── CLAUDE.md                     # Development guidelines
├── TASK.md                       # Task tracking
├── tailwind.config.js            # Design tokens
└── README.md                     # Project overview
```

### Desired Codebase Tree (After Implementation)
```bash
board-game-bike/
├── public/
│   ├── assets/
│   │   ├── images/              # Character avatars, bike parts
│   │   └── sounds/              # Sound effects (optional MVP)
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── game/                # Game phase components
│   │   │   ├── GameBoard.jsx         - Main game container
│   │   │   ├── RouteMap.jsx          - Progress visualization
│   │   │   ├── StatusBar.jsx         - Stats display
│   │   │   └── EventModal.jsx        - Random event handler
│   │   ├── setup/               # Setup phase components
│   │   │   ├── TeamBuilder.jsx       - Character selection
│   │   │   ├── BikeCustomizer.jsx    - Bike parts selection
│   │   │   ├── FormationPlanner.jsx  - Formation editor
│   │   │   └── PreparationPanel.jsx  - Training/supplies
│   │   ├── results/             # Results phase
│   │   │   ├── ResultsScreen.jsx     - Final scores
│   │   │   └── AchievementCard.jsx   - Achievement display
│   │   ├── ui/                  # Reusable UI components
│   │   │   ├── Button.jsx            - Styled buttons
│   │   │   ├── Card.jsx              - Card container
│   │   │   ├── Modal.jsx             - Modal dialogs
│   │   │   ├── ProgressBar.jsx       - Progress indicators
│   │   │   └── Tooltip.jsx           - Info tooltips
│   │   ├── CharacterCard.jsx    # [EXISTS] Character display
│   │   ├── FormationEditor.jsx  # [EXISTS] Formation UI
│   │   └── GamePlay.jsx         # [EXISTS] Game screen
│   ├── hooks/                   # Custom React hooks
│   │   ├── useGameState.js           - Game state management
│   │   ├── useAnimation.js           - GSAP animation helpers
│   │   └── useLocalStorage.js        - LocalStorage persistence
│   ├── store/                   # Redux Toolkit
│   │   ├── gameSlice.js              - Game phase, progress, events
│   │   ├── teamSlice.js              - Team members, formation
│   │   ├── bikeSlice.js              - Bike parts, stats
│   │   ├── playerSlice.js            - Player profile, achievements
│   │   └── store.js                  - Redux store config
│   ├── services/                # Business logic
│   │   ├── gameEngine.js             - Core simulation logic
│   │   ├── calculations.js           - Stats calculations
│   │   ├── eventGenerator.js         - Random events
│   │   └── storage.js                - LocalStorage helpers
│   ├── data/                    # Static game data
│   │   ├── characters.js             - Character definitions
│   │   ├── bikeParts.js              - Bike parts catalog
│   │   ├── routes.js                 - Route segments
│   │   └── events.js                 - Event templates
│   ├── utils/                   # Utility functions
│   │   ├── constants.js              - Game constants
│   │   ├── helpers.js                - Helper functions
│   │   └── animations.js             - GSAP animation presets
│   ├── pages/                   # Route pages
│   │   ├── StartPage.jsx             - Landing page
│   │   ├── SetupPage.jsx             - Setup phase
│   │   ├── GamePage.jsx              - Racing phase
│   │   └── ResultsPage.jsx           - Results phase
│   ├── App.jsx                  - Root component with routing
│   ├── main.jsx                 - Entry point
│   └── styles/
│       └── globals.css          # [EXISTS] Global styles
├── tests/                       # Vitest tests
│   ├── components/
│   ├── services/
│   └── utils/
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions for deployment
├── index.html                   # HTML entry
├── package.json                 # Dependencies
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # [EXISTS] Tailwind config
├── .eslintrc.cjs               # ESLint config
├── .prettierrc                  # Prettier config
└── vitest.config.js            # Test configuration
```

### Known Gotchas & Library Quirks
```javascript
// CRITICAL: GSAP + React Memory Leaks
// ALWAYS cleanup animations in useEffect
useEffect(() => {
  const tl = gsap.timeline();
  tl.to(ref.current, { x: 100, duration: 1 });

  return () => {
    tl.kill(); // REQUIRED: Prevent memory leaks
  };
}, []);

// CRITICAL: Redux Toolkit Immer
// Can mutate state directly in reducers (Immer handles immutability)
reducers: {
  updateDistance: (state, action) => {
    state.currentDistance += action.payload; // OK with Immer
  }
}

// CRITICAL: GitHub Pages Routing
// MUST use HashRouter, not BrowserRouter
import { HashRouter } from 'react-router-dom';
// Reason: GitHub Pages doesn't support client-side routing with clean URLs

// CRITICAL: Vite Base Path for GitHub Pages
// In vite.config.js:
export default defineConfig({
  base: '/board-game-bike/', // Match your repo name
  // ...
});

// CRITICAL: Tailwind Purge
// In tailwind.config.js content array:
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}", // Must include all extensions
],
// Reason: Missing files = missing styles in production

// CRITICAL: PropTypes for Validation
import PropTypes from 'prop-types';
CharacterCard.propTypes = {
  character: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
};
// Reason: This project uses PropTypes, not TypeScript

// CRITICAL: GSAP Transform Performance
// USE: transform properties (GPU accelerated)
gsap.to(el, { x: 100, y: 50, scale: 1.2 });
// AVOID: top, left, width, height (slower)
gsap.to(el, { left: '100px' }); // ❌ Bad

// CRITICAL: LocalStorage Size Limit
// Max ~5MB per domain
// Store only essential game state, not full history
const gameState = {
  playerProfile: { name, bestTime, achievements },
  settings: { volume, difficulty },
};
localStorage.setItem('cycling-game', JSON.stringify(gameState));

// CRITICAL: React 18 Automatic Batching
// Multiple setState calls batched automatically
setSpeed(newSpeed);
setDistance(newDistance);
setStamina(newStamina);
// All trigger single re-render in React 18
```

---

## Implementation Blueprint

### Data Models and Structures

#### Game State (Redux Store)
```javascript
// store/gameSlice.js
const initialState = {
  phase: 'start', // 'start' | 'setup' | 'racing' | 'results'
  currentDistance: 0,
  totalDistance: 380, // km (Taipei to Kaohsiung)
  timeElapsed: 0, // seconds
  speed: 0, // km/h
  weather: {
    type: 'clear', // 'clear' | 'windy' | 'rainy'
    windDirection: 0, // degrees
    windSpeed: 0, // km/h
  },
  events: [], // Array of { id, type, timestamp, data }
  isPaused: false,
  isComplete: false,
};

// store/teamSlice.js
const initialState = {
  members: [], // Array of character objects
  formation: 'single', // 'single' | 'double' | 'train'
  currentLeader: 0, // Index of current leader
  morale: 100, // 0-100
  averageStamina: 100, // 0-100
};

// store/bikeSlice.js
const initialState = {
  frame: null, // { id, name, weight, aero, cost }
  wheels: null,
  gears: null,
  accessories: [],
  totalWeight: 0,
  aeroDynamics: 0,
  totalCost: 0,
  budget: 5000, // Budget limit
};
```

#### Character Data Structure
```javascript
// data/characters.js
export const characterTypes = {
  CLIMBER: {
    id: 'climber',
    name: '爬坡手',
    type: 'climber',
    typeLabel: '爬坡專家',
    baseStats: {
      speed: 70,
      stamina: 80,
      teamwork: 60,
      climbing: 95, // Specialty
      sprinting: 50,
      recovery: 70,
    },
    specialty: '山路加成 +20%',
    cost: 1200,
    description: '擅長爬坡路段，在上坡時速度衰減較少',
  },
  // ... other types
};
```

---

## Task List (In Order)

### Task 1: Project Initialization
```yaml
EXECUTE (terminal commands):
  - npm create vite@latest . -- --template react
  - npm install
  - npm install @reduxjs/toolkit react-redux
  - npm install react-router-dom
  - npm install gsap
  - npm install -D tailwindcss postcss autoprefixer
  - npx tailwindcss init -p
  - npm install prop-types
  - npm install clsx
  - npm install react-hot-toast
  - npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
  - npm install -D eslint eslint-plugin-react eslint-plugin-react-hooks
  - npm install -D prettier eslint-config-prettier

CREATE vite.config.js:
  - IMPORT: vite, @vitejs/plugin-react
  - SET base: '/board-game-bike/' (for GitHub Pages)
  - ADD alias: '@': path.resolve(__dirname, './src')
  - CONFIGURE test environment for vitest

MODIFY tailwind.config.js:
  - REPLACE with existing content from project root
  - VERIFY content paths include all JSX files

CREATE .eslintrc.cjs:
  - ADD React plugin and recommended rules
  - ADD hooks rules
  - SET parserOptions for JSX

CREATE .prettierrc:
  - SET single quotes, 2 space indent
  - ADD trailing comma
  - SET printWidth 100

MODIFY package.json scripts:
  - ADD "dev": "vite"
  - ADD "build": "vite build"
  - ADD "preview": "vite preview"
  - ADD "test": "vitest"
  - ADD "lint": "eslint src --ext js,jsx"
  - ADD "format": "prettier --write \"src/**/*.{js,jsx}\""
```

**Validation Gate 1.1**:
```bash
npm run dev
# Expected: Dev server starts on http://localhost:5173
# Should see Vite + React default page

npm run build
# Expected: Build succeeds, creates dist/ folder
# Check: dist/index.html exists, no errors

npm run lint
# Expected: No errors (or only default template issues)
```

---

### Task 2: Core File Structure Setup
```yaml
CREATE src/App.jsx:
  - IMPORT: HashRouter, Routes, Route from react-router-dom
  - IMPORT: Provider from react-redux
  - IMPORT: Toaster from react-hot-toast
  - SETUP Routes for Start, Setup, Game, Results pages
  - WRAP in Redux Provider
  - ADD Toaster for notifications

CREATE src/main.jsx:
  - IMPORT: React, ReactDOM, App, globals.css
  - RENDER App to root div

MODIFY index.html:
  - UPDATE title: "一日北高挑戰 | Taipei to Kaohsiung Challenge"
  - ADD meta viewport for mobile
  - ADD meta description

CREATE src/utils/constants.js:
  - DEFINE: GAME_PHASES, FORMATION_TYPES
  - DEFINE: TOTAL_DISTANCE = 380
  - DEFINE: TIME_LIMIT = 24 * 60 * 60 (24 hours in seconds)
  - DEFINE: BUDGET_LIMIT = 5000

CREATE src/data/ folder with placeholder files:
  - characters.js (export empty array for now)
  - bikeParts.js (export empty object)
  - routes.js (export route segments)
  - events.js (export event templates)
```

**Validation Gate 2.1**:
```bash
npm run dev
# Expected: Blank page (no routes implemented yet)
# Check browser console: No errors
```

---

### Task 3: Redux Store Setup
```yaml
CREATE src/store/store.js:
  - IMPORT: configureStore from @reduxjs/toolkit
  - CREATE store with placeholder reducers
  - EXPORT store

CREATE src/store/gameSlice.js:
  - IMPORT: createSlice from @reduxjs/toolkit
  - DEFINE initialState (phase, distance, time, weather, events)
  - CREATE reducers:
    - setPhase(state, action)
    - updateDistance(state, action)
    - updateTime(state, action)
    - addEvent(state, action)
    - togglePause(state, action)
    - resetGame(state)
  - CREATE selectors:
    - selectGamePhase
    - selectProgress (distance / total)
    - selectCurrentStats
  - EXPORT slice and actions

CREATE src/store/teamSlice.js:
  - DEFINE initialState (members, formation, morale, stamina)
  - CREATE reducers:
    - addMember(state, action)
    - removeMember(state, action)
    - setFormation(state, action)
    - updateMorale(state, action)
    - updateStamina(state, action)
    - rotateLead(state)
  - CREATE selectors
  - EXPORT

CREATE src/store/bikeSlice.js:
  - DEFINE initialState (parts, stats, budget)
  - CREATE reducers:
    - selectFrame, selectWheels, selectGears
    - calculateTotalWeight
    - calculateAeroDynamics
    - calculateTotalCost
  - CREATE selectors
  - EXPORT

CREATE src/store/playerSlice.js:
  - DEFINE initialState (name, bestTime, achievements, settings)
  - CREATE reducers for profile management
  - EXPORT

INTEGRATE all slices in store.js:
  - IMPORT all slices
  - ADD to configureStore reducers
```

**Pseudocode for gameSlice reducer**:
```javascript
// PATTERN: Immer allows direct mutation in Redux Toolkit
updateDistance: (state, action) => {
  // Direct mutation OK with Immer
  state.currentDistance += action.payload;

  // Check completion
  if (state.currentDistance >= state.totalDistance) {
    state.phase = 'results';
    state.isComplete = true;
  }

  // CRITICAL: Update speed based on time delta
  // speed = distance / time (simplified, actual needs delta)
},

addEvent: (state, action) => {
  // PATTERN: Push to array directly (Immer)
  state.events.push({
    id: Date.now(),
    timestamp: state.timeElapsed,
    ...action.payload
  });

  // GOTCHA: Limit event history to last 50 to prevent memory bloat
  if (state.events.length > 50) {
    state.events.shift();
  }
},
```

**Validation Gate 3.1**:
```bash
# CREATE tests/store/gameSlice.test.js
npm run test
# Expected: All reducer tests pass
# Test: Initial state, each reducer action, selectors
```

---

### Task 4: Game Data Definitions
```yaml
POPULATE src/data/characters.js:
  - DEFINE 4 character types (CLIMBER, SPRINTER, DOMESTIQUE, ALL_ROUNDER)
  - EACH with: id, name, type, baseStats, specialty, cost, description
  - FOLLOW structure from PLANNING.md
  - EXPORT as characterTypes object and charactersArray

POPULATE src/data/bikeParts.js:
  - DEFINE frames array (3+ options)
  - DEFINE wheels array (3+ options)
  - DEFINE gears array (2+ options)
  - DEFINE accessories array (optional MVP)
  - EACH with: id, name, weight, stats, cost
  - EXPORT as categorized object

POPULATE src/data/routes.js:
  - DEFINE route segments with:
    - distance, elevation, terrain type
    - Notable landmarks (for progress visualization)
  - EXPORT routeSegments array

POPULATE src/data/events.js:
  - DEFINE event templates:
    - Weather changes (probability, effects)
    - Mechanical failures (probability, severity)
    - Supply stations (locations, benefits)
    - Road conditions (effects on speed/stamina)
  - EXPORT eventTemplates array
```

**Validation Gate 4.1**:
```javascript
// Test data structure
import { characterTypes } from '@/data/characters';
console.log(characterTypes.CLIMBER);
// Expected: Object with all required properties
// Check: All stats are numbers 0-100
```

---

### Task 5: Game Engine Service
```yaml
CREATE src/services/gameEngine.js:
  - FUNCTION startRace(teamConfig, bikeConfig, preparation)
    - Initialize race state
    - Return initial simulation state

  - FUNCTION updateRaceState(currentState, deltaTime)
    - Calculate speed based on:
      * Team formation bonus
      * Bike aerodynamics
      * Current terrain
      * Weather effects
      * Team stamina
    - Update distance: distance += speed * deltaTime
    - Update stamina: Apply fatigue based on effort
    - Update morale: Based on events and progress
    - Generate random events (probability-based)
    - RETURN updated state

  - FUNCTION handleEvent(state, event)
    - Apply event effects to state
    - Update morale/stamina/speed accordingly
    - RETURN modified state

CREATE src/services/calculations.js:
  - FUNCTION calculateSpeed(team, bike, weather, terrain)
    - Base speed from team average
    - Apply formation bonus (see PLANNING.md)
    - Apply bike aerodynamics bonus
    - Apply weather modifier (wind direction)
    - Apply terrain modifier (climbing/flat)
    - RETURN final speed

  - FUNCTION calculateStaminaDrain(speed, formation, terrain)
    - Base drain rate
    - Increase for leader position
    - Modify by terrain difficulty
    - RETURN drain per second

  - FUNCTION calculateScore(completionTime, teamIntegrity, efficiency)
    - Time bonus: (24h - actualTime) * 100
    - Team bonus: completedMembers * 50
    - Efficiency bonus: (1 - avgFatigueRate) * 200
    - RETURN total score

CREATE src/services/eventGenerator.js:
  - FUNCTION generateRandomEvent(currentState, eventTemplates)
    - Check probabilities
    - Select event based on current conditions
    - RETURN event object or null

  - FUNCTION getEventProbability(eventType, currentState)
    - Calculate probability based on:
      * Distance traveled
      * Weather conditions
      * Equipment condition
    - RETURN probability 0-1
```

**Pseudocode for updateRaceState**:
```javascript
export function updateRaceState(state, deltaTime) {
  // CRITICAL: All calculations must use deltaTime for frame-independence

  // 1. Calculate current speed
  const speed = calculateSpeed(
    state.team,
    state.bike,
    state.weather,
    getCurrentTerrain(state.distance)
  );

  // 2. Update distance
  const distanceDelta = (speed / 3600) * deltaTime; // speed in km/h, time in seconds
  const newDistance = state.distance + distanceDelta;

  // 3. Update stamina (leader drains faster)
  const staminaDrain = calculateStaminaDrain(speed, state.formation, terrain);
  const newStamina = state.team.map((member, idx) => {
    const isLeader = idx === state.currentLeader;
    const drain = isLeader ? staminaDrain * 1.5 : staminaDrain;
    return Math.max(0, member.stamina - drain * deltaTime);
  });

  // 4. Auto-rotate leader if stamina low
  let newLeader = state.currentLeader;
  if (newStamina[newLeader] < 30) {
    newLeader = findNextLeader(newStamina); // PATTERN: Find highest stamina
  }

  // 5. Random events (probability-based)
  let newEvent = null;
  if (Math.random() < getEventProbability('any', state)) {
    newEvent = generateRandomEvent(state, eventTemplates);
  }

  // 6. Apply event effects if any
  if (newEvent) {
    applyEventEffects(state, newEvent);
  }

  // RETURN updated state (immutable)
  return {
    ...state,
    distance: newDistance,
    speed,
    team: newStamina,
    currentLeader: newLeader,
    events: newEvent ? [...state.events, newEvent] : state.events,
  };
}
```

**Validation Gate 5.1**:
```javascript
// CREATE tests/services/gameEngine.test.js
// Test cases:
test('speed calculation applies formation bonus correctly', () => {
  const speed = calculateSpeed(mockTeam, mockBike, clearWeather, flatTerrain);
  // Formation 'train' should give 25% wind resistance reduction
  expect(speed).toBeGreaterThan(baseSpeed * 1.2);
});

test('stamina drains faster for leader', () => {
  const state = updateRaceState(initialState, 10); // 10 seconds
  expect(state.team[state.currentLeader].stamina).toBeLessThan(
    state.team[1].stamina // non-leader
  );
});

test('race completes when distance >= 380km', () => {
  const state = { ...initialState, distance: 379 };
  const final = updateRaceState(state, 100); // Large time jump
  expect(final.isComplete).toBe(true);
});
```

---

### Task 6: UI Components - Base Components
```yaml
CREATE src/components/ui/Button.jsx:
  - MIRROR pattern from existing Tailwind config (btn-primary class)
  - PROPS: children, variant, size, onClick, disabled
  - USE clsx for conditional classes
  - ADD PropTypes validation

CREATE src/components/ui/Card.jsx:
  - USE 'card' class from Tailwind config
  - PROPS: children, className, hover effect
  - SUPPORT onClick for interactive cards

CREATE src/components/ui/Modal.jsx:
  - CREATE overlay with backdrop blur
  - PROPS: isOpen, onClose, title, children
  - ADD close on Escape key (useEffect listener)
  - ADD ARIA attributes for accessibility
  - USE GSAP for fade-in animation

CREATE src/components/ui/ProgressBar.jsx:
  - PROPS: value (0-100), label, color
  - ANIMATED progress fill (GSAP or CSS transition)
  - DISPLAY percentage text

CREATE src/components/ui/Tooltip.jsx:
  - USE absolute positioning
  - PROPS: content, children, position
  - SHOW on hover/focus
  - ADD aria-describedby
```

**Pattern for Button.jsx**:
```javascript
import PropTypes from 'prop-types';
import clsx from 'clsx';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className
}) => {
  const baseClasses = 'btn-base'; // From Tailwind config
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
  };
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Button;
```

**Validation Gate 6.1**:
```bash
# CREATE tests/components/ui/Button.test.jsx
npm run test
# Test: Renders correctly, handles clicks, applies classes, disabled state
```

---

### Task 7: Setup Phase - Team Builder
```yaml
CREATE src/components/setup/TeamBuilder.jsx:
  - IMPORT: CharacterCard (existing)
  - IMPORT: characterTypes from data
  - USE: useSelector for current team, useDispatch for actions
  - LAYOUT: Grid of CharacterCards
  - STATE: selectedMembers (array of character IDs)
  - LIMIT: Max 4 team members, enforce budget
  - CALCULATE: Total cost, team average stats
  - DISPLAY: Budget remaining, team composition
  - VALIDATION: At least 2 members required

ENHANCE existing src/components/CharacterCard.jsx:
  - VERIFY PropTypes include all needed props
  - ADD cost display if not present
  - ENSURE accessibility (keyboard navigation)
```

**Pseudocode for TeamBuilder**:
```javascript
const TeamBuilder = ({ onComplete }) => {
  const dispatch = useDispatch();
  const selectedMembers = useSelector(state => state.team.members);
  const budget = useSelector(state => state.bike.budget);

  const [characters] = useState(Object.values(characterTypes));

  const handleSelectCharacter = (characterId) => {
    const character = characters.find(c => c.id === characterId);
    const totalCost = calculateTotalCost(selectedMembers) + character.cost;

    // VALIDATION: Budget check
    if (totalCost > budget) {
      toast.error('預算不足！');
      return;
    }

    // VALIDATION: Max team size
    if (selectedMembers.length >= 4) {
      toast.error('團隊已滿（最多4人）');
      return;
    }

    // ADD to team
    dispatch(addMember(character));

    // ANIMATION: Celebrate selection
    gsap.fromTo('.team-summary',
      { scale: 1 },
      { scale: 1.05, duration: 0.2, yoyo: true, repeat: 1 }
    );
  };

  const canProceed = selectedMembers.length >= 2;

  return (
    <div className="team-builder">
      <h2>選擇團隊成員</h2>

      {/* Character grid */}
      <div className="grid grid-cols-auto-fit gap-6">
        {characters.map(char => (
          <CharacterCard
            key={char.id}
            character={char}
            isSelected={selectedMembers.some(m => m.id === char.id)}
            onSelect={handleSelectCharacter}
          />
        ))}
      </div>

      {/* Team summary */}
      <div className="team-summary mt-8 p-6 card">
        <h3>已選擇: {selectedMembers.length}/4</h3>
        <p>剩餘預算: ${budget - calculateTotalCost(selectedMembers)}</p>
        <Button
          onClick={onComplete}
          disabled={!canProceed}
        >
          下一步：選擇裝備
        </Button>
      </div>
    </div>
  );
};
```

**Validation Gate 7.1**:
```bash
npm run dev
# Manual test: Click characters, verify selection, check budget enforcement
# Test: Cannot select > 4 members, cannot exceed budget, can proceed with 2+
```

---

### Task 8: Setup Phase - Bike Customizer
```yaml
CREATE src/components/setup/BikeCustomizer.jsx:
  - IMPORT: bikeParts from data
  - LAYOUT: Three sections (Frame, Wheels, Gears)
  - DISPLAY: Each part as selectable card with stats
  - SHOW: Total weight, aerodynamics, cost
  - USE: Redux bikeSlice actions
  - CALCULATE: Running total vs budget
  - HIGHLIGHT: Best value options (optional)

CREATE src/components/setup/PartCard.jsx:
  - PROPS: part, isSelected, onSelect
  - DISPLAY: Name, stats (weight, aero), cost
  - STYLE: Similar to CharacterCard pattern
  - ANIMATION: Select bounce (GSAP)
```

**Pseudocode for stat calculations**:
```javascript
const calculateBikeStats = (frame, wheels, gears) => {
  // PATTERN: Reduce to sum all parts
  const totalWeight = [frame, wheels, gears]
    .filter(Boolean)
    .reduce((sum, part) => sum + part.weight, 0);

  // Aero is NOT additive, it's average weighted by importance
  const aeroScore = (
    (frame?.aero || 0) * 0.5 +  // Frame most important
    (wheels?.aero || 0) * 0.35 + // Wheels second
    (gears?.aero || 0) * 0.15    // Gears least
  );

  const totalCost = [frame, wheels, gears]
    .filter(Boolean)
    .reduce((sum, part) => sum + part.cost, 0);

  return { totalWeight, aeroScore, totalCost };
};
```

---

### Task 9: Setup Phase - Formation Planner
```yaml
ENHANCE existing src/components/FormationEditor.jsx:
  - ADD formation type selector (Single, Double, Train)
  - DISPLAY formation bonuses (wind resistance %)
  - ALLOW: Drag-drop to reorder team members
  - SHOW: Visual representation of formation
  - CALCULATE: Efficiency score for current formation
  - USE: Redux teamSlice actions (setFormation)

CREATE formation visualization:
  - SVG or CSS representation of cyclists in formation
  - ANIMATE position changes (GSAP)
```

---

### Task 10: Setup Phase - Preparation Panel
```yaml
CREATE src/components/setup/PreparationPanel.jsx:
  - SELECT training type (High Intensity, Endurance, Balanced)
  - PLAN supply strategy (Energy bars, Drinks, Water)
  - CHOOSE route variant (Coastal, Mountain, Mixed)
  - DISPLAY: Effects of each choice on stats
  - STORE: Preparation choices in Redux
```

---

### Task 11: Pages - Setup Page Integration
```yaml
CREATE src/pages/SetupPage.jsx:
  - COMBINE: TeamBuilder, BikeCustomizer, FormationPlanner, PreparationPanel
  - USE: Multi-step wizard pattern
  - SHOW: Progress indicator (Step 1/4, 2/4, etc.)
  - NAVIGATE: Next/Previous between steps
  - VALIDATE: Each step before allowing next
  - FINAL: "Start Race" button when all complete
  - DISPATCH: setPhase('racing') when starting
```

**Wizard pattern**:
```javascript
const SetupPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const steps = [
    { component: TeamBuilder, title: '選擇團隊', validate: validateTeam },
    { component: BikeCustomizer, title: '配置裝備', validate: validateBike },
    { component: FormationPlanner, title: '編排隊形', validate: validateFormation },
    { component: PreparationPanel, title: '事前準備', validate: validatePrep },
  ];

  const handleNext = () => {
    if (steps[currentStep].validate()) {
      if (currentStep === steps.length - 1) {
        // Start race
        dispatch(setPhase('racing'));
        navigate('/game');
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="setup-page">
      {/* Progress indicator */}
      <ProgressIndicator current={currentStep + 1} total={steps.length} />

      {/* Current step */}
      <CurrentStepComponent onComplete={handleNext} />

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="secondary"
          onClick={() => setCurrentStep(prev => prev - 1)}
          disabled={currentStep === 0}
        >
          上一步
        </Button>
        <Button onClick={handleNext}>
          {currentStep === steps.length - 1 ? '開始挑戰' : '下一步'}
        </Button>
      </div>
    </div>
  );
};
```

**Validation Gate 11.1**:
```bash
npm run dev
# Test complete setup flow: Select team → Customize bike → Plan formation → Prepare
# Verify: Cannot proceed without meeting requirements at each step
# Check: Redux state updates correctly at each step
```

---

### Task 12: Racing Phase - Game Loop
```yaml
CREATE src/hooks/useGameLoop.js:
  - USE: useEffect with requestAnimationFrame for game loop
  - CALCULATE: deltaTime between frames
  - DISPATCH: updateRaceState action every frame
  - HANDLE: Pause/resume
  - CLEANUP: Cancel animation frame on unmount

  PATTERN:
  useEffect(() => {
    let rafId;
    let lastTime = Date.now();

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000; // Convert to seconds
      lastTime = now;

      if (!isPaused) {
        dispatch(updateGameState(deltaTime));
      }

      rafId = requestAnimationFrame(gameLoop);
    };

    rafId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(rafId); // CRITICAL: Cleanup
  }, [isPaused]);
```

---

### Task 13: Racing Phase - Game Board
```yaml
CREATE src/components/game/GameBoard.jsx:
  - IMPORT: RouteMap, StatusBar, EventModal
  - USE: useGameLoop hook
  - DISPLAY: Real-time game state
  - SHOW: Pause/Resume button
  - HANDLE: Event modal display

CREATE src/components/game/RouteMap.jsx:
  - VISUALIZE: Route from Taipei to Kaohsiung
  - SHOW: Current position indicator (moving cyclist icon)
  - DISPLAY: Landmarks (major cities along route)
  - ANIMATE: Progress movement (GSAP)
  - MARK: Supply stations, events

CREATE src/components/game/StatusBar.jsx:
  - DISPLAY: Real-time stats
    * Distance: X / 380 km
    * Time: HH:MM:SS
    * Speed: XX km/h
    * Average Stamina: XX%
    * Morale: XX%
  - USE: ProgressBar for stamina/morale
  - COLOR CODE: Red if low (<30%), yellow if medium, green if good

CREATE src/components/game/EventModal.jsx:
  - SHOW: Random event description
  - DISPLAY: Event effects
  - PROVIDE: Choices (if applicable)
  - ANIMATE: Slide-in from top (GSAP)
  - CLOSE: After user acknowledges or makes choice
```

**RouteMap animation pattern**:
```javascript
// Animate cyclist position based on progress
useEffect(() => {
  const progress = distance / totalDistance; // 0 to 1
  const mapWidth = mapRef.current.offsetWidth;
  const targetX = progress * mapWidth;

  gsap.to(cyclistRef.current, {
    x: targetX,
    duration: 0.5,
    ease: 'power2.out',
  });
}, [distance]);
```

---

### Task 14: Racing Phase - Real-time Updates
```yaml
INTEGRATE game engine with Redux:
  - CREATE: src/services/gameLoop.js
  - FUNCTION: processGameTick(state, deltaTime)
    * Call gameEngine.updateRaceState
    * Dispatch results to Redux
    * Handle event generation

CONNECT: GameBoard to Redux state
  - useSelector for all game stats
  - Update UI reactively when state changes

ADD: Event handlers for user actions
  - Pause/Resume race
  - Handle event choices
  - Manual formation rotation (advanced feature)
```

---

### Task 15: Results Phase
```yaml
CREATE src/components/results/ResultsScreen.jsx:
  - DISPLAY: Final stats
    * Completion time
    * Total distance covered
    * Team members finished
    * Final morale/stamina
  - CALCULATE: Final score (using calculations.js)
  - SHOW: Score breakdown
  - DISPLAY: Achievements earned
  - PROVIDE: Buttons
    * Share results (copy stats to clipboard)
    * Play again (reset Redux state)
    * View leaderboard (LocalStorage)

CREATE src/components/results/AchievementCard.jsx:
  - PROPS: achievement (title, description, icon)
  - ANIMATE: Unlock animation (GSAP scale + glow)
  - DISPLAY: Achievement badge

IMPLEMENT achievements logic:
  - Check conditions (all members finished, under budget, fast time, etc.)
  - Award achievements
  - Save to playerSlice
  - Persist to LocalStorage
```

**Score calculation implementation**:
```javascript
export function calculateFinalScore(raceResults) {
  const {
    completionTime, // seconds
    teamFinished, // number of members
    totalTeamSize,
    averageFatigue, // 0-1
    budgetUsed,
    budgetLimit,
    eventsHandled,
  } = raceResults;

  // Time bonus (max 24 hours)
  const hoursUsed = completionTime / 3600;
  const timeBonus = Math.max(0, (24 - hoursUsed) * 100);

  // Team integrity bonus
  const teamBonus = (teamFinished / totalTeamSize) * 500;

  // Efficiency bonus
  const efficiencyBonus = (1 - averageFatigue) * 300;

  // Budget efficiency
  const budgetBonus = budgetUsed < budgetLimit ? 200 : 0;

  // Event handling bonus
  const eventBonus = eventsHandled * 50;

  const totalScore = Math.round(
    timeBonus + teamBonus + efficiencyBonus + budgetBonus + eventBonus
  );

  return {
    totalScore,
    breakdown: {
      timeBonus,
      teamBonus,
      efficiencyBonus,
      budgetBonus,
      eventBonus,
    },
  };
}
```

---

### Task 16: Start Page & Routing
```yaml
CREATE src/pages/StartPage.jsx:
  - DISPLAY: Game title with gradient text
  - SHOW: Game description
  - BUTTON: "開始遊戲" → navigate to /setup
  - BUTTON: "遊戲說明" → open instructions modal
  - BUTTON: "設定" → open settings modal
  - ANIMATE: Title entrance (GSAP)

CREATE src/pages/GamePage.jsx:
  - RENDER: GameBoard component
  - GUARD: Redirect to /setup if team not configured

CREATE src/pages/ResultsPage.jsx:
  - RENDER: ResultsScreen component
  - GUARD: Redirect to / if no race completed

CONFIGURE: src/App.jsx routes
  - / → StartPage
  - /setup → SetupPage
  - /game → GamePage
  - /results → ResultsPage
```

**Route guards pattern**:
```javascript
const GamePage = () => {
  const teamMembers = useSelector(state => state.team.members);
  const navigate = useNavigate();

  useEffect(() => {
    // GUARD: Ensure setup is complete
    if (teamMembers.length < 2) {
      toast.error('請先選擇團隊成員');
      navigate('/setup');
    }
  }, [teamMembers, navigate]);

  return <GameBoard />;
};
```

---

### Task 17: LocalStorage Persistence
```yaml
CREATE src/services/storage.js:
  - FUNCTION: saveGameState(state)
    * Save to localStorage
    * Handle quota exceeded errors
  - FUNCTION: loadGameState()
    * Load from localStorage
    * Parse JSON safely
  - FUNCTION: clearGameState()

  - FUNCTION: savePlayerProfile(profile)
  - FUNCTION: loadPlayerProfile()

  - FUNCTION: saveLeaderboard(scores)
  - FUNCTION: getLeaderboard()

INTEGRATE with Redux:
  - SUBSCRIBE to store changes
  - Debounce saves (only save every 2 seconds)
  - Save on critical actions (phase changes)

  PATTERN:
  const debouncedSave = debounce((state) => {
    saveGameState(state);
  }, 2000);

  store.subscribe(() => {
    const state = store.getState();
    debouncedSave(state);
  });

LOAD on app start:
  - In main.jsx or App.jsx
  - Load saved state and dispatch to Redux
  - Show "Continue Game" option if saved state exists
```

---

### Task 18: Polish & UX Improvements
```yaml
ADD loading states:
  - CREATE: src/components/ui/Spinner.jsx
  - SHOW: During game initialization
  - SHOW: During route changes

ADD error boundaries:
  - CREATE: src/components/ErrorBoundary.jsx
  - WRAP: App in ErrorBoundary
  - DISPLAY: Friendly error message if crash
  - OFFER: Reset game button

ADD toast notifications:
  - USE: react-hot-toast
  - NOTIFY: On achievements, errors, warnings
  - STYLE: Match game design (custom toast styles)

ADD sound effects (optional MVP):
  - Cheering on completion
  - Alert on events
  - Click sounds
  - USE: HTML5 Audio API

ADD tutorial/instructions:
  - Modal explaining game mechanics
  - Tooltips on first visit
  - Help icons throughout UI

IMPROVE accessibility:
  - Add aria-labels
  - Ensure keyboard navigation
  - Test with screen reader
  - Add focus indicators
```

---

### Task 19: Performance Optimization
```yaml
OPTIMIZE components:
  - ADD: React.memo to expensive components
    * CharacterCard
    * PartCard
    * RouteMap (if re-rendering too often)

  - USE: useMemo for expensive calculations
    * calculateBikeStats
    * calculateFinalScore
    * Formation efficiency calculations

  - USE: useCallback for event handlers passed as props
    * onSelect, onClick, etc.

OPTIMIZE Redux:
  - USE: Reselect for memoized selectors
  - AVOID: Selecting entire state, select only needed slices

OPTIMIZE assets:
  - COMPRESS: Images to WebP format
  - USE: Lazy loading for images
  - MINIFY: SVG files

CODE SPLITTING:
  - USE: React.lazy for route components
  - EXAMPLE:
    const GamePage = lazy(() => import('./pages/GamePage'));
  - WRAP: In Suspense with loading fallback

BUNDLE SIZE:
  - CHECK: Bundle analyzer
  - REMOVE: Unused dependencies
  - TREE-SHAKE: Ensure imports are specific
    * import { func } from 'library'; // Good
    * import * as lib from 'library'; // Bad
```

---

### Task 20: Testing
```yaml
CREATE tests for critical paths:

  tests/services/gameEngine.test.js:
    - Test race initialization
    - Test speed calculations
    - Test stamina drain
    - Test event generation
    - Test completion detection

  tests/services/calculations.test.js:
    - Test formation bonus calculations
    - Test score calculation
    - Test edge cases (0 stamina, max speed, etc.)

  tests/components/CharacterCard.test.jsx:
    - Test rendering
    - Test selection
    - Test flip animation trigger
    - Test disabled state

  tests/store/gameSlice.test.js:
    - Test all reducers
    - Test selectors
    - Test state transitions

  INTEGRATION tests:
    - Test complete game flow (setup → race → results)
    - Test state persistence (save/load)

RUN tests:
  npm run test
  # Target: >80% coverage for critical code
```

---

### Task 21: GitHub Pages Deployment
```yaml
CREATE .github/workflows/deploy.yml:
  - TRIGGER: On push to main branch
  - STEPS:
    1. Checkout code
    2. Setup Node.js
    3. Install dependencies
    4. Run tests
    5. Run lint
    6. Build production
    7. Deploy to gh-pages branch

  EXAMPLE workflow:
  ```yaml
  name: Deploy to GitHub Pages

  on:
    push:
      branches: [ main ]

  jobs:
    build-and-deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3

        - name: Setup Node.js
          uses: actions/setup-node@v3
          with:
            node-version: '18'

        - name: Install dependencies
          run: npm ci

        - name: Run tests
          run: npm test

        - name: Run linter
          run: npm run lint

        - name: Build
          run: npm run build

        - name: Deploy to GitHub Pages
          uses: peaceiris/actions-gh-pages@v3
          with:
            github_token: ${{ secrets.GITHUB_TOKEN }}
            publish_dir: ./dist
  ```

VERIFY vite.config.js:
  - base: '/board-game-bike/' (match repo name)

CREATE gh-pages branch:
  - git checkout --orphan gh-pages
  - git rm -rf .
  - git commit --allow-empty -m "Initial gh-pages commit"
  - git push origin gh-pages

CONFIGURE GitHub repository:
  - Settings → Pages
  - Source: gh-pages branch
  - Wait for deployment
```

---

### Task 22: Documentation & README
```yaml
UPDATE README.md:
  - ADD: Game description and features
  - ADD: Demo link (GitHub Pages URL)
  - ADD: Screenshots (after deployment)
  - ADD: Installation instructions
    ```bash
    npm install
    npm run dev
    ```
  - ADD: Build instructions
  - ADD: Tech stack section
  - ADD: Game mechanics overview
  - ADD: Credits and license

CREATE docs/DEVELOPMENT.md (optional):
  - Architecture overview
  - State management diagram
  - Game engine explanation
  - Adding new features guide

UPDATE TASK.md:
  - Mark completed tasks
  - Add any discovered tasks
```

---

## Validation Loop

### Level 1: Syntax & Build
```bash
# FIRST: Ensure code compiles
npm run lint
# Expected: No errors
# If errors: Fix linting issues, re-run

npm run build
# Expected: Build completes, dist/ folder created
# Check dist/index.html exists
# If errors: Fix build issues, check imports and dependencies
```

### Level 2: Unit Tests
```bash
# Run all tests
npm run test
# Expected: All tests pass
# Target: >80% coverage for core logic (gameEngine, calculations)

# Run specific test suites
npm run test -- gameEngine.test.js
# If failing: Read error, fix logic, re-run
# NEVER mock core calculations just to pass tests
```

### Level 3: Integration Testing (Manual)
```bash
# Start dev server
npm run dev

# Test complete game flow:
# 1. Visit http://localhost:5173
# 2. Click "開始遊戲"
# 3. Select 2-4 team members (verify budget enforcement)
# 4. Customize bike parts (verify stat calculations)
# 5. Set formation (verify visual update)
# 6. Start race
# 7. Observe real-time updates (distance, speed, stamina)
# 8. Wait for random event (or trigger manually if test mode)
# 9. Complete race or fail (low stamina)
# 10. View results screen
# 11. Check score calculation
# 12. Try "Play Again" (verify state reset)

# Test LocalStorage:
# - Close browser
# - Reopen
# - Check if state persisted (if implemented)

# Test responsive design:
# - Resize browser to mobile (375px)
# - Check layout doesn't break
# - Test touch interactions

# Expected: No console errors, smooth animations, all features functional
```

### Level 4: Performance Testing
```bash
# Build production
npm run build
npm run preview

# Open browser DevTools
# Run Lighthouse audit
# Expected scores:
# - Performance: >85
# - Accessibility: >90
# - Best Practices: >90
# - SEO: >80

# Check bundle size:
# dist/assets/index-*.js should be <500KB
# If larger: Investigate with bundle analyzer
```

### Level 5: Cross-browser Testing
```bash
# Test on:
# - Chrome (latest)
# - Firefox (latest)
# - Safari (latest, if Mac)
# - Edge (latest)

# Verify:
# - Animations work smoothly
# - No layout issues
# - Game functions correctly
# - LocalStorage works
```

---

## Final Validation Checklist

Pre-deployment verification:

- [ ] All tests pass: `npm run test`
- [ ] No linting errors: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Preview works: `npm run preview`
- [ ] Game playable start-to-finish with no errors
- [ ] All 4 character types available
- [ ] Bike customization affects game stats
- [ ] Formation changes affect wind resistance
- [ ] Random events appear during race
- [ ] Score calculation correct
- [ ] LocalStorage saves/loads state
- [ ] Responsive on mobile, tablet, desktop
- [ ] Lighthouse score >85 all categories
- [ ] No console errors in production
- [ ] README updated with demo link
- [ ] All documentation complete
- [ ] GitHub Actions workflow configured
- [ ] Deployed successfully to GitHub Pages

---

## Anti-Patterns to Avoid

- ❌ **Don't** create new component patterns - use existing CharacterCard as reference
- ❌ **Don't** use BrowserRouter - GitHub Pages requires HashRouter
- ❌ **Don't** forget GSAP cleanup - causes memory leaks
- ❌ **Don't** mutate Redux state outside createSlice reducers
- ❌ **Don't** skip PropTypes validation - important for debugging
- ❌ **Don't** use inline styles - use Tailwind classes
- ❌ **Don't** create files >300 lines - refactor into smaller components
- ❌ **Don't** use `any` type or skip type checking
- ❌ **Don't** hardcode values - use constants.js
- ❌ **Don't** ignore accessibility - add ARIA labels and keyboard nav
- ❌ **Don't** optimize prematurely - profile first, then optimize
- ❌ **Don't** deploy without testing - always test production build locally first

---

## Success Metrics

After implementation, the project should achieve:

**Technical Quality:**
- ✅ 0 console errors in production
- ✅ Lighthouse Performance >85
- ✅ Test coverage >80% for core logic
- ✅ Bundle size <1MB total
- ✅ First Contentful Paint <2s

**Functionality:**
- ✅ All game mechanics working as designed
- ✅ Smooth 60fps animations
- ✅ Responsive on all screen sizes
- ✅ State persists across sessions
- ✅ Game completable in 5-10 minutes

**User Experience:**
- ✅ Intuitive setup flow
- ✅ Clear feedback on all actions
- ✅ Engaging visual design
- ✅ Accessible to keyboard users
- ✅ Fast load times

---

## PRP Confidence Score: 8.5/10

**Strengths:**
- Comprehensive context provided (existing components, design system, game mechanics)
- Clear task breakdown with order dependencies
- Executable validation gates at each level
- Detailed pseudocode for complex logic
- Strong reference to existing patterns
- Complete deployment strategy

**Potential Challenges:**
- Game balance may require iteration after testing
- GSAP animation complexity could cause issues if cleanup is forgotten
- Performance optimization might be needed based on device testing
- Event probability tuning will require playtesting

**Mitigation:**
- Follow validation gates strictly
- Test frequently during development
- Use existing CharacterCard pattern as reference
- Start simple, add complexity incrementally
- Profile performance early and often

This PRP provides sufficient context and structure for one-pass implementation with iterative refinement through the validation loops.
