class ModuleLoader {
  constructor() {
    this.currentModule = null;
    this.container = null;
  }

  setContainer(container) {
    this.container = container;
  }

  async load(moduleId) {
    if (!this.container) {
      console.error('No container set for module loader');
      return false;
    }

    const module = window.ModuleRegistry.get(moduleId);

    if (!module) {
      console.error(`Module ${moduleId} not found`);
      return false;
    }

    await this.unload();

    this.currentModule = module;

    this.container.innerHTML = '';

    try {
      await module.start(this.container);
      console.log(`Module ${module.name} loaded`);

      if (window.Analytics) {
        window.Analytics.trackModuleStart(module.id, module.name);
      }

      if (window.TelegramAdapter) {
        window.TelegramAdapter.haptic('impact', 'medium');
      }

      return true;
    } catch (error) {
      console.error(`Error loading module ${module.name}:`, error);
      this.container.innerHTML = `
        <div class="error-message">
          <p>Failed to load module: ${module.name}</p>
          <p class="error-details">${error.message}</p>
        </div>
      `;
      return false;
    }
  }

  async unload() {
    if (this.currentModule) {
      try {
        if (window.Analytics) {
          window.Analytics.trackModuleEnd(this.currentModule.id, this.currentModule.name);
        }

        if (this.currentModule.stop) {
          await this.currentModule.stop();
        }
        console.log(`Module ${this.currentModule.name} unloaded`);
      } catch (error) {
        console.error(`Error unloading module ${this.currentModule.name}:`, error);
      }

      this.currentModule = null;
    }

    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  getCurrentModule() {
    return this.currentModule;
  }

  isModuleLoaded(moduleId) {
    return this.currentModule && this.currentModule.id === moduleId;
  }
}

window.ModuleLoader = new ModuleLoader();
