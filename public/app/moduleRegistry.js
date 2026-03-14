class ModuleRegistry {
  constructor() {
    this.modules = new Map();
  }

  register(module) {
    if (!module.id || !module.name || !module.start) {
      console.error('Invalid module registration:', module);
      return false;
    }

    if (this.modules.has(module.id)) {
      console.warn(`Module ${module.id} already registered`);
      return false;
    }

    // Store the entire module object to preserve all methods and context
    this.modules.set(module.id, module);

    console.log(`Module registered: ${module.name}`);
    return true;
  }

  get(id) {
    return this.modules.get(id);
  }

  getAll() {
    return Array.from(this.modules.values());
  }

  getAllByType(type) {
    return this.getAll().filter(module => module.type === type);
  }

  has(id) {
    return this.modules.has(id);
  }

  unregister(id) {
    return this.modules.delete(id);
  }
}

window.ModuleRegistry = new ModuleRegistry();
