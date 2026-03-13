class Analytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();
    this.currentModule = null;
    this.moduleStartTime = null;
    this.events = [];
    this.isEnabled = true;
    this.storageKey = 'analytics_events';
    this.maxStoredEvents = 1000;

    this.initializeSession();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  initializeSession() {
    this.trackEvent('session_start', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: this.getPlatform(),
      screenSize: `${window.innerWidth}x${window.innerHeight}`
    });

    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    setInterval(() => {
      this.trackHeartbeat();
    }, 60000);
  }

  getPlatform() {
    if (window.Telegram?.WebApp?.platform) {
      return `telegram_${window.Telegram.WebApp.platform}`;
    }
    return 'web';
  }

  getUserId() {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      return window.Telegram.WebApp.initDataUnsafe.user.id;
    }
    let userId = localStorage.getItem('analytics_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_user_id', userId);
    }
    return userId;
  }

  trackEvent(eventName, data = {}) {
    if (!this.isEnabled) return;

    const event = {
      sessionId: this.sessionId,
      userId: this.getUserId(),
      eventName: eventName,
      timestamp: new Date().toISOString(),
      data: data,
      module: this.currentModule,
      sessionDuration: Date.now() - this.sessionStart
    };

    this.events.push(event);
    this.logToConsole(event);
    this.storeEvent(event);

    return event;
  }

  trackModuleStart(moduleId, moduleName) {
    this.currentModule = moduleId;
    this.moduleStartTime = Date.now();

    this.trackEvent('module_opened', {
      moduleId: moduleId,
      moduleName: moduleName
    });
  }

  trackModuleEnd(moduleId, moduleName) {
    if (this.moduleStartTime) {
      const duration = Date.now() - this.moduleStartTime;

      this.trackEvent('module_closed', {
        moduleId: moduleId,
        moduleName: moduleName,
        duration: duration,
        durationSeconds: Math.round(duration / 1000)
      });
    }

    this.currentModule = null;
    this.moduleStartTime = null;
  }

  trackButtonClick(buttonName, context = {}) {
    this.trackEvent('button_click', {
      buttonName: buttonName,
      ...context
    });
  }

  trackGameStart(gameName) {
    this.trackEvent('game_start', {
      gameName: gameName
    });
  }

  trackGameEnd(gameName, score, duration = null) {
    this.trackEvent('game_end', {
      gameName: gameName,
      score: score,
      duration: duration
    });
  }

  trackGameRestart(gameName) {
    this.trackEvent('game_restart', {
      gameName: gameName
    });
  }

  trackShare(shareName, context = {}) {
    this.trackEvent('share', {
      shareName: shareName,
      ...context
    });
  }

  trackHeartbeat() {
    this.trackEvent('heartbeat', {
      sessionDuration: Date.now() - this.sessionStart,
      activeModule: this.currentModule
    });
  }

  endSession() {
    const sessionDuration = Date.now() - this.sessionStart;

    this.trackEvent('session_end', {
      duration: sessionDuration,
      durationSeconds: Math.round(sessionDuration / 1000),
      totalEvents: this.events.length
    });
  }

  logToConsole(event) {
    const style = 'color: #3b82f6; font-weight: bold;';
    console.log(
      `%c[Analytics] ${event.eventName}`,
      style,
      {
        module: event.module,
        data: event.data,
        timestamp: event.timestamp
      }
    );
  }

  storeEvent(event) {
    try {
      let storedEvents = [];
      const stored = localStorage.getItem(this.storageKey);

      if (stored) {
        storedEvents = JSON.parse(stored);
      }

      storedEvents.push(event);

      if (storedEvents.length > this.maxStoredEvents) {
        storedEvents = storedEvents.slice(-this.maxStoredEvents);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(storedEvents));
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
    }
  }

  getStoredEvents() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to retrieve stored events:', error);
      return [];
    }
  }

  clearStoredEvents() {
    localStorage.removeItem(this.storageKey);
    this.events = [];
  }

  getSessionSummary() {
    const sessionDuration = Date.now() - this.sessionStart;
    const eventsByType = {};

    this.events.forEach(event => {
      eventsByType[event.eventName] = (eventsByType[event.eventName] || 0) + 1;
    });

    return {
      sessionId: this.sessionId,
      userId: this.getUserId(),
      startTime: new Date(this.sessionStart).toISOString(),
      duration: sessionDuration,
      durationSeconds: Math.round(sessionDuration / 1000),
      totalEvents: this.events.length,
      eventsByType: eventsByType,
      currentModule: this.currentModule
    };
  }

  async sendToSupabase(events = null) {
    if (!window.SupabaseClient?.client) {
      console.warn('Supabase not available. Events stored locally.');
      return false;
    }

    const eventsToSend = events || this.getStoredEvents();

    if (eventsToSend.length === 0) {
      return true;
    }

    try {
      const { data, error } = await window.SupabaseClient.client
        .from('analytics_events')
        .insert(eventsToSend.map(event => ({
          session_id: event.sessionId,
          user_id: event.userId,
          event_name: event.eventName,
          event_data: event.data,
          module_id: event.module,
          timestamp: event.timestamp,
          session_duration: event.sessionDuration
        })));

      if (error) {
        console.error('Failed to send analytics to Supabase:', error);
        return false;
      }

      console.log(`Successfully sent ${eventsToSend.length} events to Supabase`);
      return true;
    } catch (error) {
      console.error('Error sending analytics:', error);
      return false;
    }
  }

  enableSupabaseSync(intervalMinutes = 5) {
    setInterval(async () => {
      const events = this.getStoredEvents();
      if (events.length > 0) {
        const success = await this.sendToSupabase(events);
        if (success) {
          this.clearStoredEvents();
        }
      }
    }, intervalMinutes * 60 * 1000);

    console.log(`Analytics Supabase sync enabled (every ${intervalMinutes} minutes)`);
  }

  enable() {
    this.isEnabled = true;
    console.log('Analytics enabled');
  }

  disable() {
    this.isEnabled = false;
    console.log('Analytics disabled');
  }

  printSummary() {
    const summary = this.getSessionSummary();
    console.table(summary.eventsByType);
    console.log('Session Summary:', summary);
  }
}

window.Analytics = new Analytics();
