# Mini App Hub - Architecture Guardrails

## Platform Overview

Mini App Hub is a modular web application platform designed for Telegram WebApps and standard browsers. The platform acts as a mini-app hub capable of hosting multiple apps (games and utilities).

## Core Architecture Principles

### Separation of Concerns

The platform maintains strict separation between:
- **Core Platform** - System-level functionality
- **Modules** - Individual apps and games

This separation ensures platform stability and allows safe module development.

---

## Protected Core Files

The following files are **PROTECTED** and must **NEVER** be modified by modules:

```
app/
  ├── app.js              - Central app controller
  ├── moduleRegistry.js   - Module registration system
  ├── moduleLoader.js     - Dynamic module loader
  ├── uiManager.js        - UI and navigation manager
  └── telegramAdapter.js  - Telegram WebApp integration

styles/
  └── master.css          - Global design system
```

### Why These Files Are Protected

1. **app.js** - Controls application lifecycle and module loading
2. **moduleRegistry.js** - Manages the central module registry
3. **moduleLoader.js** - Handles safe module loading/unloading
4. **uiManager.js** - Controls navigation and UI state
5. **telegramAdapter.js** - Provides Telegram API abstraction
6. **master.css** - Defines design tokens and base styles

Modifying these files can break the entire platform and affect all modules.

---

## Module Development Rules

### 1. Location

All modules **MUST** be created in the `/modules` directory:

```
modules/
  ├── moduleTemplate.js   - Template for new modules
  ├── tapGame.js
  ├── reactionGame.js
  ├── memoryGame.js
  └── bubblePop.js
```

### 2. Module Structure

Modules must use the self-contained IIFE pattern:

```javascript
(function() {
  // Module-scoped variables
  let state = {};
  let elements = {};

  function start(container) {
    // Initialize and render into container
  }

  function cleanup() {
    // Clean up resources
  }

  // Register with platform
  window.ModuleRegistry.register({
    id: 'module-id',
    name: 'Module Name',
    icon: '🎮',
    type: 'game',
    start: start,
    stop: cleanup
  });
})();
```

### 3. Registration Requirements

All modules **MUST** register using `ModuleRegistry.register()`:

**Required Fields:**
- `id` - Unique identifier (kebab-case)
- `name` - Display name shown in menu
- `icon` - Emoji icon for menu card
- `type` - Category type: `'game'`, `'tool'`, `'utility'`, or custom type
- `start` - Function that receives container element

**Optional Fields:**
- `description` - Brief description for menu card
- `stop` - Cleanup function called when module unloads

**Category System:**

The menu automatically creates category sections based on module types:
- `'game'` → **Games** section
- `'tool'` → **Tools** section
- `'utility'` → **Utilities** section
- Custom types → Auto-generated section (e.g., `'widget'` → **Widgets**)

Categories appear in this order: Games, Tools, Utilities, then any custom types.
If a category has no modules, it won't be displayed.

### 4. Rendering Rules

Modules **MUST**:
- Render **ONLY** inside the provided container
- Never access or modify elements outside the container
- Never modify global DOM (except for `<style>` tags if absolutely necessary)
- Use `data-element` attributes for all interactive elements

**Example:**

```javascript
function start(container) {
  container.innerHTML = `
    <div class="module-root" data-element="module-root">
      <div class="game-container">
        <h2 class="game-title" data-element="title">My Game</h2>
        <button class="game-button" data-element="start">Start</button>
      </div>
    </div>
  `;
}
```

### 5. Cleanup Requirements

Modules **MUST** implement proper cleanup:

```javascript
function cleanup() {
  // Clear all timers
  if (timer) clearInterval(timer);

  // Clear all timeouts
  if (timeout) clearTimeout(timeout);

  // Remove event listeners (handled automatically if using container.innerHTML)

  // Reset state
  state = {};
  elements = {};
}
```

### 6. Styling Guidelines

**Use Existing Classes:**
- `game-container` - Main game wrapper
- `game-title` - Module title
- `game-subtitle` - Module subtitle
- `game-stats` - Stats container
- `stat-item` - Individual stat
- `stat-label` - Stat label
- `stat-value` - Stat value
- `game-button` - Action buttons

**Use Design Tokens:**
```css
var(--bg-primary)      /* #1a1a1a */
var(--bg-secondary)    /* #242424 */
var(--bg-tertiary)     /* #2d2d2d */
var(--text-primary)    /* #ffffff */
var(--text-secondary)  /* #a0a0a0 */
var(--accent)          /* #3b82f6 */
var(--success)         /* #10b981 */
var(--danger)          /* #ef4444 */
var(--warning)         /* #f59e0b */
var(--radius)          /* 16px */
var(--radius-sm)       /* 12px */
var(--radius-lg)       /* 20px */
```

### 7. Platform Integration

**Telegram Features:**

Access Telegram functionality via `window.TelegramAdapter`:

```javascript
// Get user information
const user = window.TelegramAdapter.getUser();

// Trigger haptic feedback
window.TelegramAdapter.haptic('impact', 'medium');

// Check if running in Telegram
if (window.TelegramAdapter.isReady()) {
  // Telegram-specific features
}
```

**Available Methods:**
- `getUser()` - Get user info (works in browser too)
- `haptic(type, style)` - Trigger haptic feedback
- `expand()` - Expand WebApp to full height
- `close()` - Close WebApp
- `showAlert(message)` - Show alert dialog
- `isReady()` - Check if Telegram is available

---

## Adding New Modules

### Step 1: Create Module File

Copy `modules/moduleTemplate.js` to create a new module:

```bash
cp modules/moduleTemplate.js modules/myGame.js
```

### Step 2: Implement Module Logic

Edit your new module file:
1. Update registration details (id, name, icon, type)
2. Implement `start(container)` function
3. Implement `cleanup()` function
4. Add your game/tool logic

### Step 3: Register Module

Add your module to `app/app.js`:

```javascript
async loadModules() {
  const moduleScripts = [
    '/modules/tapGame.js',
    '/modules/reactionGame.js',
    '/modules/memoryGame.js',
    '/modules/bubblePop.js',
    '/modules/myGame.js'  // Add your module
  ];
  // ...
}
```

### Step 4: Test

Build and test your module:

```bash
npm run build
```

---

## Module Lifecycle

1. **Registration** - Module registers with `ModuleRegistry.register()`
2. **Menu Display** - Platform auto-generates menu card
3. **Launch** - User taps "Launch" button
4. **Start** - Platform calls `start(container)`
5. **Running** - Module runs inside container
6. **Stop** - User navigates back or restarts
7. **Cleanup** - Platform calls `stop()` function

---

## Best Practices

### DO:
✅ Use `moduleTemplate.js` as starting point
✅ Keep modules self-contained
✅ Use provided design tokens
✅ Implement proper cleanup
✅ Use data-element attributes
✅ Test in both browser and Telegram
✅ Handle errors gracefully

### DON'T:
❌ Modify core platform files
❌ Access elements outside container
❌ Pollute global scope
❌ Forget cleanup functions
❌ Hard-code colors or sizes
❌ Assume Telegram is always available
❌ Skip error handling

---

## File Structure

```
project/
├── index.html
├── public/
│   ├── app/                  # PROTECTED - Core platform
│   │   ├── app.js
│   │   ├── moduleRegistry.js
│   │   ├── moduleLoader.js
│   │   ├── uiManager.js
│   │   └── telegramAdapter.js
│   ├── modules/              # Module development area
│   │   ├── moduleTemplate.js
│   │   ├── tapGame.js
│   │   ├── reactionGame.js
│   │   ├── memoryGame.js
│   │   └── bubblePop.js
│   └── styles/               # PROTECTED - Design system
│       └── master.css
└── ARCHITECTURE.md           # This file
```

---

## Platform API Reference

### ModuleRegistry

```javascript
// Register a module
ModuleRegistry.register(moduleConfig)

// Get a module by ID
ModuleRegistry.get(id)

// Get all modules
ModuleRegistry.getAll()

// Get modules by type
ModuleRegistry.getAllByType(type)

// Check if module exists
ModuleRegistry.has(id)
```

### ModuleLoader

```javascript
// Load a module (used internally)
ModuleLoader.load(moduleId)

// Unload current module
ModuleLoader.unload()

// Get current module
ModuleLoader.getCurrentModule()
```

### TelegramAdapter

```javascript
// Get user info
TelegramAdapter.getUser()

// Haptic feedback
TelegramAdapter.haptic('impact', 'light|medium|heavy')
TelegramAdapter.haptic('notification', 'success|warning|error')
TelegramAdapter.haptic('selection')

// WebApp controls
TelegramAdapter.expand()
TelegramAdapter.close()

// Dialogs
TelegramAdapter.showAlert(message)
TelegramAdapter.showConfirm(message, callback)

// Check availability
TelegramAdapter.isReady()
```

---

## Deployment

The platform builds to a static site ready for deployment:

```bash
npm run build
```

Output is in `dist/` directory. Deploy to:
- Netlify
- Vercel
- GitHub Pages
- Any static hosting

---

## Support

For questions about module development, refer to:
- `modules/moduleTemplate.js` - Commented template
- Existing modules - Working examples
- This document - Architecture rules

---

**Remember: Never modify core platform files. Keep modules isolated and self-contained.**
