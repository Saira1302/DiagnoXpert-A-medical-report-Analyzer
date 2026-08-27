type Listener = (payload: unknown) => void;

class EventBus {
  private listeners = new Map<string, Set<Listener>>();

  subscribe(userId: string, listener: Listener): () => void {
    let set = this.listeners.get(userId);
    if (!set) {
      set = new Set();
      this.listeners.set(userId, set);
    }
    set.add(listener);
    return () => {
      const s = this.listeners.get(userId);
      if (!s) return;
      s.delete(listener);
      if (s.size === 0) this.listeners.delete(userId);
    };
  }

  publish(userId: string, payload: unknown): void {
    const set = this.listeners.get(userId);
    if (!set) return;
    for (const fn of set) {
      try {
        fn(payload);
      } catch (err) {
        console.error("eventBus listener error", err);
      }
    }
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __dx_event_bus: EventBus | undefined;
}

const eventBus = globalThis.__dx_event_bus ?? new EventBus();
if (process.env.NODE_ENV !== "production") {
  globalThis.__dx_event_bus = eventBus;
}

export default eventBus;
