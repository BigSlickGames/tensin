(function() {
  let state = {
    formData: {
      name: '',
      icon: '📦',
      type: 'tool',
      description: ''
    },
    generatedCode: null
  };

  let elements = {};

  function start(container) {
    initializeState();
    render(container);
    attachEventListeners();
  }

  function initializeState() {
    state = {
      formData: {
        name: '',
        icon: '📦',
        type: 'tool',
        description: ''
      },
      generatedCode: null
    };
    elements = {};
  }

  function render(container) {
    container.innerHTML = `
      <style>
        .generator-form {
          max-width: 600px;
          margin: 0 auto;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: var(--text-primary);
          font-size: 14px;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 14px;
          font-family: inherit;
          transition: border-color 0.2s;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: var(--accent-color);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-hint {
          margin-top: 6px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .icon-picker {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .icon-option {
          width: 44px;
          height: 44px;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-secondary);
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .icon-option:hover {
          transform: scale(1.1);
          border-color: var(--accent-color);
        }

        .icon-option.selected {
          border-color: var(--accent-color);
          background: rgba(var(--accent-rgb), 0.1);
        }

        .button-group {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .btn {
          flex: 1;
          padding: 14px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: var(--accent-color);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 2px solid var(--border-color);
        }

        .btn-secondary:hover {
          background: var(--bg-tertiary);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .preview-section {
          margin-top: 32px;
          padding: 20px;
          background: var(--bg-secondary);
          border-radius: 12px;
          border: 2px solid var(--border-color);
        }

        .preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .preview-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .module-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--bg-primary);
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .module-icon-large {
          font-size: 48px;
        }

        .module-details {
          flex: 1;
        }

        .module-name {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .module-meta {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .success-message {
          padding: 16px;
          background: rgba(34, 197, 94, 0.1);
          border: 2px solid rgb(34, 197, 94);
          border-radius: 8px;
          color: rgb(34, 197, 94);
          text-align: center;
          margin-top: 16px;
          font-weight: 600;
        }
      </style>

      <div class="module-root" data-element="module-root">
        <div class="game-container">
          <h2 class="game-title">Module Generator</h2>
          <p class="game-subtitle">Create new modules from template</p>

          <div class="generator-form">
            <div class="form-group">
              <label class="form-label">Module Name</label>
              <input
                type="text"
                class="form-input"
                data-element="name-input"
                placeholder="e.g., Math Quiz"
              />
              <div class="form-hint">A descriptive name for your module</div>
            </div>

            <div class="form-group">
              <label class="form-label">Icon</label>
              <div class="icon-picker" data-element="icon-picker">
                <div class="icon-option selected" data-icon="📦">📦</div>
                <div class="icon-option" data-icon="🎮">🎮</div>
                <div class="icon-option" data-icon="🎯">🎯</div>
                <div class="icon-option" data-icon="🎲">🎲</div>
                <div class="icon-option" data-icon="🧩">🧩</div>
                <div class="icon-option" data-icon="🎨">🎨</div>
                <div class="icon-option" data-icon="🔧">🔧</div>
                <div class="icon-option" data-icon="⚙️">⚙️</div>
                <div class="icon-option" data-icon="📊">📊</div>
                <div class="icon-option" data-icon="🚀">🚀</div>
                <div class="icon-option" data-icon="💡">💡</div>
                <div class="icon-option" data-icon="🎪">🎪</div>
              </div>
              <div class="form-hint">Select an emoji icon for your module</div>
            </div>

            <div class="form-group">
              <label class="form-label">Type</label>
              <select class="form-select" data-element="type-select">
                <option value="tool">Tool</option>
                <option value="game">Game</option>
                <option value="utility">Utility</option>
              </select>
              <div class="form-hint">Category for module organization</div>
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea
                class="form-textarea"
                data-element="description-input"
                placeholder="A brief description of what your module does..."
              ></textarea>
              <div class="form-hint">Optional description shown in the module list</div>
            </div>

            <div class="button-group">
              <button class="btn btn-primary" data-element="generate-btn">
                Generate Module
              </button>
              <button class="btn btn-secondary" data-element="reset-btn">
                Reset Form
              </button>
            </div>
          </div>

          <div class="preview-section" data-element="preview-section" style="display: none;">
            <div class="preview-header">
              <div class="preview-title">Generated Module</div>
            </div>

            <div class="module-info" data-element="module-info">
              <div class="module-icon-large" data-element="preview-icon">📦</div>
              <div class="module-details">
                <div class="module-name" data-element="preview-name">Module Name</div>
                <div class="module-meta">
                  <span data-element="preview-type">tool</span> •
                  <span data-element="preview-filename">module.js</span>
                </div>
              </div>
            </div>

            <div class="button-group">
              <button class="btn btn-primary" data-element="download-btn">
                Download Module
              </button>
              <button class="btn btn-secondary" data-element="copy-btn">
                Copy Code
              </button>
            </div>

            <div class="success-message" data-element="success-message" style="display: none;">
              Module code copied to clipboard!
            </div>
          </div>
        </div>
      </div>
    `;

    cacheElements(container);
  }

  function cacheElements(container) {
    elements.nameInput = container.querySelector('[data-element="name-input"]');
    elements.iconPicker = container.querySelector('[data-element="icon-picker"]');
    elements.typeSelect = container.querySelector('[data-element="type-select"]');
    elements.descriptionInput = container.querySelector('[data-element="description-input"]');
    elements.generateBtn = container.querySelector('[data-element="generate-btn"]');
    elements.resetBtn = container.querySelector('[data-element="reset-btn"]');
    elements.previewSection = container.querySelector('[data-element="preview-section"]');
    elements.moduleInfo = container.querySelector('[data-element="module-info"]');
    elements.previewIcon = container.querySelector('[data-element="preview-icon"]');
    elements.previewName = container.querySelector('[data-element="preview-name"]');
    elements.previewType = container.querySelector('[data-element="preview-type"]');
    elements.previewFilename = container.querySelector('[data-element="preview-filename"]');
    elements.downloadBtn = container.querySelector('[data-element="download-btn"]');
    elements.copyBtn = container.querySelector('[data-element="copy-btn"]');
    elements.successMessage = container.querySelector('[data-element="success-message"]');
  }

  function attachEventListeners() {
    elements.iconPicker.addEventListener('click', handleIconClick);
    elements.nameInput.addEventListener('input', handleNameInput);
    elements.typeSelect.addEventListener('change', handleTypeChange);
    elements.descriptionInput.addEventListener('input', handleDescriptionInput);
    elements.generateBtn.addEventListener('click', handleGenerate);
    elements.resetBtn.addEventListener('click', handleReset);
    elements.downloadBtn.addEventListener('click', handleDownload);
    elements.copyBtn.addEventListener('click', handleCopy);
  }

  function handleIconClick(e) {
    const iconOption = e.target.closest('.icon-option');
    if (!iconOption) return;

    elements.iconPicker.querySelectorAll('.icon-option').forEach(opt => {
      opt.classList.remove('selected');
    });

    iconOption.classList.add('selected');
    state.formData.icon = iconOption.dataset.icon;

    if (window.TelegramAdapter) {
      window.TelegramAdapter.haptic('selection_change');
    }
  }

  function handleNameInput(e) {
    state.formData.name = e.target.value;
  }

  function handleTypeChange(e) {
    state.formData.type = e.target.value;
  }

  function handleDescriptionInput(e) {
    state.formData.description = e.target.value;
  }

  function handleGenerate() {
    const validation = window.ModuleGenerator.validateOptions(state.formData);

    if (!validation.valid) {
      alert('Please fix the following errors:\n\n' + validation.errors.join('\n'));
      return;
    }

    state.generatedCode = window.ModuleGenerator.generateModuleCode(state.formData);
    const moduleInfo = window.ModuleGenerator.getModuleInfo(state.formData);

    elements.previewIcon.textContent = moduleInfo.icon;
    elements.previewName.textContent = moduleInfo.name;
    elements.previewType.textContent = moduleInfo.type;
    elements.previewFilename.textContent = moduleInfo.filename;

    elements.previewSection.style.display = 'block';
    elements.successMessage.style.display = 'none';

    elements.previewSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    if (window.TelegramAdapter) {
      window.TelegramAdapter.haptic('notification', 'success');
    }
  }

  function handleReset() {
    state.formData = {
      name: '',
      icon: '📦',
      type: 'tool',
      description: ''
    };
    state.generatedCode = null;

    elements.nameInput.value = '';
    elements.typeSelect.value = 'tool';
    elements.descriptionInput.value = '';

    elements.iconPicker.querySelectorAll('.icon-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    elements.iconPicker.querySelector('[data-icon="📦"]').classList.add('selected');

    elements.previewSection.style.display = 'none';

    if (window.TelegramAdapter) {
      window.TelegramAdapter.haptic('impact', 'light');
    }
  }

  function handleDownload() {
    const result = window.ModuleGenerator.downloadModule(state.formData);

    if (window.TelegramAdapter) {
      window.TelegramAdapter.haptic('notification', 'success');
    }

    console.log('Downloaded:', result.filename);
  }

  function handleCopy() {
    window.ModuleGenerator.copyToClipboard(state.formData)
      .then(success => {
        if (success) {
          elements.successMessage.style.display = 'block';

          setTimeout(() => {
            elements.successMessage.style.display = 'none';
          }, 3000);

          if (window.TelegramAdapter) {
            window.TelegramAdapter.haptic('notification', 'success');
          }
        } else {
          alert('Failed to copy to clipboard. Please try downloading instead.');
        }
      });
  }

  function cleanup() {
    state = {
      formData: {
        name: '',
        icon: '📦',
        type: 'tool',
        description: ''
      },
      generatedCode: null
    };
    elements = {};
  }

  window.ModuleRegistry.register({
    id: 'module-generator',
    name: 'Module Generator',
    icon: '🏗️',
    type: 'utility',
    description: 'Create new modules using the module template',
    start: start,
    stop: cleanup
  });
})();
