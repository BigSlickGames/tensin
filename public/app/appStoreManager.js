class AppStoreManager {
  constructor() {
    this.supabase = null;
    this.moduleMetadata = new Map();
  }

  async initialize() {
    if (!window.SupabaseClient?.client) {
      console.warn('Supabase client not available');
      return;
    }

    this.supabase = window.SupabaseClient.client;
    await this.syncModules();
  }

  async syncModules() {
    const modules = window.ModuleRegistry.getAll();

    for (const module of modules) {
      await this.ensureModuleExists(module);
    }

    await this.loadMetadata();
    await this.setDefaultFeatured();
  }

  async setDefaultFeatured() {
    if (!this.supabase) return;

    try {
      const { data: featuredCount } = await this.supabase
        .from('module_metadata')
        .select('id', { count: 'exact', head: true })
        .eq('is_featured', true);

      if (!featuredCount || featuredCount === 0) {
        const defaultFeatured = ['tap-game', 'memory-game', 'bubble-pop'];

        for (const moduleId of defaultFeatured) {
          const { error } = await this.supabase
            .from('module_metadata')
            .update({ is_featured: true })
            .eq('id', moduleId);

          if (error) {
            console.warn(`Failed to set ${moduleId} as featured:`, error);
          }
        }

        await this.loadMetadata();
      }
    } catch (error) {
      console.error('Error setting default featured:', error);
    }
  }

  async ensureModuleExists(module) {
    if (!this.supabase) return;

    try {
      const { data: existing } = await this.supabase
        .from('module_metadata')
        .select('id')
        .eq('id', module.id)
        .maybeSingle();

      if (!existing) {
        const { error } = await this.supabase
          .from('module_metadata')
          .insert({
            id: module.id,
            name: module.name,
            icon: module.icon || '📦',
            type: module.type || 'tool',
            description: module.description || ''
          });

        if (error) {
          console.error('Failed to insert module metadata:', error);
        }
      }
    } catch (error) {
      console.error('Error ensuring module exists:', error);
    }
  }

  async loadMetadata() {
    if (!this.supabase) return;

    try {
      const { data, error } = await this.supabase
        .from('module_metadata')
        .select('*');

      if (error) {
        console.error('Failed to load metadata:', error);
        return;
      }

      if (data) {
        this.moduleMetadata.clear();
        data.forEach(item => {
          this.moduleMetadata.set(item.id, item);
        });
      }
    } catch (error) {
      console.error('Error loading metadata:', error);
    }
  }

  async incrementLaunchCount(moduleId) {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase
        .from('module_metadata')
        .update({
          launch_count: this.supabase.raw('launch_count + 1'),
          updated_at: new Date().toISOString()
        })
        .eq('id', moduleId);

      if (error) {
        console.error('Failed to increment launch count:', error);
      } else {
        const metadata = this.moduleMetadata.get(moduleId);
        if (metadata) {
          metadata.launch_count += 1;
        }
      }
    } catch (error) {
      console.error('Error incrementing launch count:', error);
    }
  }

  async setFeatured(moduleId, isFeatured) {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase
        .from('module_metadata')
        .update({
          is_featured: isFeatured,
          updated_at: new Date().toISOString()
        })
        .eq('id', moduleId);

      if (error) {
        console.error('Failed to update featured status:', error);
      } else {
        await this.loadMetadata();
      }
    } catch (error) {
      console.error('Error updating featured status:', error);
    }
  }

  getMetadata(moduleId) {
    return this.moduleMetadata.get(moduleId);
  }

  getFeaturedModules() {
    const modules = window.ModuleRegistry.getAll();
    return modules
      .filter(module => {
        const metadata = this.moduleMetadata.get(module.id);
        return metadata?.is_featured === true;
      })
      .map(module => this.enrichModule(module));
  }

  getPopularModules(limit = 6) {
    const modules = window.ModuleRegistry.getAll();
    return modules
      .map(module => this.enrichModule(module))
      .sort((a, b) => (b.metadata?.launch_count || 0) - (a.metadata?.launch_count || 0))
      .slice(0, limit);
  }

  getNewModules(limit = 6) {
    const modules = window.ModuleRegistry.getAll();
    return modules
      .map(module => this.enrichModule(module))
      .sort((a, b) => {
        const aDate = a.metadata?.created_at || 0;
        const bDate = b.metadata?.created_at || 0;
        return new Date(bDate) - new Date(aDate);
      })
      .slice(0, limit);
  }

  enrichModule(module) {
    const metadata = this.moduleMetadata.get(module.id);
    return {
      ...module,
      metadata: metadata,
      url: metadata?.url || module.url
    };
  }

  getAllEnriched() {
    return window.ModuleRegistry.getAll().map(module => this.enrichModule(module));
  }

  getModuleAge(moduleId) {
    const metadata = this.moduleMetadata.get(moduleId);
    if (!metadata?.created_at) return null;

    const now = new Date();
    const created = new Date(metadata.created_at);
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'New today';
    if (diffDays === 1) return 'New yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }
}

window.AppStoreManager = new AppStoreManager();
