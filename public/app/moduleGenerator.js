class ModuleGenerator {
  constructor() {
    this.templatePath = '/modules/moduleTemplate.js';
  }

  generateModuleCode(options) {
    const {
      name,
      icon = '📦',
      type = 'tool',
      description = '',
      id = null
    } = options;

    const moduleId = id || this.generateId(name);

    const template = `/**
 * ${name.toUpperCase()}
 * Generated using ModuleGenerator
 *
 * Type: ${type}
 * Description: ${description}
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
    container.innerHTML = \`
      <div class="module-root" data-element="module-root">
        <div class="game-container">
          <h2 class="game-title" data-element="title">${name}</h2>
          <p class="game-subtitle" data-element="subtitle">${description}</p>

          <div class="module-content" data-element="content">
            <div class="game-stats" data-element="stats">
              <div class="stat-item">
                <div class="stat-label">Score</div>
                <div class="stat-value" data-element="score">0</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">Status</div>
                <div class="stat-value" data-element="status">Ready</div>
              </div>
            </div>

            <div data-element="main-area" style="margin: 20px 0; min-height: 200px; display: flex; align-items: center; justify-content: center;">
              <p style="color: var(--text-secondary);">Main content area - customize this section</p>
            </div>

            <button class="game-button" data-element="action-button">
              Start
            </button>
          </div>
        </div>
      </div>
    \`;

    cacheElements(container);
  }

  function cacheElements(container) {
    elements.root = container.querySelector('[data-element="module-root"]');
    elements.title = container.querySelector('[data-element="title"]');
    elements.subtitle = container.querySelector('[data-element="subtitle"]');
    elements.content = container.querySelector('[data-element="content"]');
    elements.stats = container.querySelector('[data-element="stats"]');
    elements.score = container.querySelector('[data-element="score"]');
    elements.status = container.querySelector('[data-element="status"]');
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
    updateStatus('Running');

    console.log('${name} started');
  }

  function stopModule() {
    state.isActive = false;
    elements.actionButton.textContent = 'Start';
    updateStatus('Ready');

    console.log('${name} stopped');
  }

  function updateScore(value) {
    if (elements.score) {
      elements.score.textContent = value;
    }
  }

  function updateStatus(status) {
    if (elements.status) {
      elements.status.textContent = status;
    }
  }

  function cleanup() {
    state.isActive = false;
    elements = {};

    console.log('${name} cleaned up');
  }

  window.ModuleRegistry.register({
    id: '${moduleId}',
    name: '${name}',
    icon: '${icon}',
    type: '${type}',
    description: '${description}',
    start: start,
    stop: cleanup
  });
})();
`;

    return template;
  }

  generateId(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  downloadModule(options) {
    const code = this.generateModuleCode(options);
    const moduleId = options.id || this.generateId(options.name);
    const filename = `${moduleId}.js`;

    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return {
      filename,
      code,
      moduleId
    };
  }

  copyToClipboard(options) {
    const code = this.generateModuleCode(options);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(code)
        .then(() => {
          console.log('Module code copied to clipboard');
          return true;
        })
        .catch(err => {
          console.error('Failed to copy to clipboard:', err);
          return false;
        });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (successful) {
          console.log('Module code copied to clipboard');
        }
        return Promise.resolve(successful);
      } catch (err) {
        document.body.removeChild(textarea);
        console.error('Failed to copy to clipboard:', err);
        return Promise.resolve(false);
      }
    }
  }

  getModuleInfo(options) {
    const moduleId = options.id || this.generateId(options.name);
    return {
      id: moduleId,
      name: options.name,
      icon: options.icon || '📦',
      type: options.type || 'tool',
      description: options.description || '',
      filename: `${moduleId}.js`,
      path: `/modules/${moduleId}.js`
    };
  }

  validateOptions(options) {
    const errors = [];

    if (!options.name || typeof options.name !== 'string' || options.name.trim() === '') {
      errors.push('Module name is required');
    }

    if (options.type && !['game', 'tool', 'utility'].includes(options.type)) {
      errors.push('Type must be "game", "tool", or "utility"');
    }

    if (options.icon && typeof options.icon !== 'string') {
      errors.push('Icon must be a string (emoji)');
    }

    if (options.description && typeof options.description !== 'string') {
      errors.push('Description must be a string');
    }

    if (options.id) {
      const idPattern = /^[a-z0-9-]+$/;
      if (!idPattern.test(options.id)) {
        errors.push('Custom ID must be lowercase letters, numbers, and hyphens only');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

window.ModuleGenerator = new ModuleGenerator();
