/**
 * MODULE TEMPLATE
 *
 * ARCHITECTURE GUARDRAILS - READ BEFORE MODIFYING
 * ================================================
 *
 * PROTECTED CORE FILES (DO NOT MODIFY):
 * - app/app.js
 * - app/moduleRegistry.js
 * - app/moduleLoader.js
 * - app/uiManager.js
 * - app/telegramAdapter.js
 * - styles/master.css
 *
 * MODULE REQUIREMENTS:
 *
 * 1. LOCATION
 *    - All modules MUST be created in /modules directory
 *    - Never modify core platform files
 *
 * 2. REGISTRATION
 *    - All modules MUST register using ModuleRegistry.register()
 *    - Required fields: id, name, icon, type, start
 *    - Optional fields: description, stop
 *
 * 3. RENDERING
 *    - Modules MUST render ONLY inside the provided container
 *    - Never access or modify elements outside the container
 *    - Never modify the global DOM (except for <style> tags if needed)
 *
 * 4. STRUCTURE
 *    - Use self-contained IIFE pattern: (function() { ... })();
 *    - Include data-element attributes for editable UI elements
 *    - Use design tokens from master.css (var(--bg-primary), etc.)
 *
 * 5. CLEANUP
 *    - Always implement a stop/cleanup function
 *    - Clear all timers, intervals, and event listeners
 *    - Reset state when module is unloaded
 *
 * 6. STYLING
 *    - Use existing CSS classes from master.css
 *    - Available classes: game-container, game-title, game-button, etc.
 *    - Add custom styles via <style> tag only if necessary
 *
 * 7. INTEGRATION
 *    - Access Telegram features via window.TelegramAdapter
 *    - Use haptic feedback, getUser(), expand() as needed
 *    - Platform will work with or without Telegram
 *
 * EXAMPLE REGISTRATION:
 *
 * window.ModuleRegistry.register({
 *   id: 'my-module',           // Unique identifier (kebab-case)
 *   name: 'My Module',         // Display name
 *   icon: '🎮',                // Emoji icon
 *   type: 'game',              // 'game', 'tool', or 'utility'
 *   description: 'Brief desc', // Optional description
 *   start: start,              // Function that receives container
 *   stop: cleanup              // Optional cleanup function
 * });
 */

(function() {
  let state = {
    isActive: false
  };

  let elements = {};

  function start(container) {
    initializeState();
    render(container);
    attachEventListeners();
  }

  function initializeState() {
    state = {
      isActive: false
    };
    elements = {};
  }

  function render(container) {
    container.innerHTML = `
      <div class="module-root" data-element="module-root">
        <div class="game-container">
          <h2 class="game-title" data-element="title">Module Name</h2>
          <p class="game-subtitle" data-element="subtitle">Module description goes here</p>

          <div class="module-content" data-element="content">
            <div class="game-stats" data-element="stats">
              <div class="stat-item">
                <div class="stat-label">Stat 1</div>
                <div class="stat-value" data-element="stat1">0</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">Stat 2</div>
                <div class="stat-value" data-element="stat2">0</div>
              </div>
            </div>

            <div data-element="main-area">
              <!-- Main interactive area goes here -->
            </div>

            <button class="game-button" data-element="action-button">
              Start
            </button>
          </div>
        </div>
      </div>
    `;

    cacheElements(container);
  }

  function cacheElements(container) {
    elements.root = container.querySelector('[data-element="module-root"]');
    elements.title = container.querySelector('[data-element="title"]');
    elements.subtitle = container.querySelector('[data-element="subtitle"]');
    elements.content = container.querySelector('[data-element="content"]');
    elements.stats = container.querySelector('[data-element="stats"]');
    elements.stat1 = container.querySelector('[data-element="stat1"]');
    elements.stat2 = container.querySelector('[data-element="stat2"]');
    elements.mainArea = container.querySelector('[data-element="main-area"]');
    elements.actionButton = container.querySelector('[data-element="action-button"]');
  }

  function attachEventListeners() {
    if (elements.actionButton) {
      elements.actionButton.addEventListener('click', handleActionButtonClick);
    }
  }

  function handleActionButtonClick() {
    if (!state.isActive) {
      startModule();
    } else {
      stopModule();
    }

    if (window.TelegramAdapter) {
      window.TelegramAdapter.haptic('impact', 'medium');
    }
  }

  function startModule() {
    state.isActive = true;
    elements.actionButton.textContent = 'Stop';

    console.log('Module started');
  }

  function stopModule() {
    state.isActive = false;
    elements.actionButton.textContent = 'Start';

    console.log('Module stopped');
  }

  function updateStat(statElement, value) {
    if (statElement) {
      statElement.textContent = value;
    }
  }

  function cleanup() {
    state.isActive = false;
    elements = {};

    console.log('Module cleaned up');
  }

  window.ModuleRegistry.register({
    id: 'module-template',
    name: 'Module Template',
    icon: '📦',
    type: 'tool',
    description: 'A reusable template for creating new modules',
    start: start,
    stop: cleanup
  });
})();
