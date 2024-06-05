type Callback = () => void;

export class Eventing {
  events: { [key: string]: Callback[] } = {};

  on = (eventName: string, callback: Callback): void => {
    const handlers = this.events[eventName] || [];
    handlers.push(callback);
    this.events[eventName] = handlers;
  };

  trigger = (eventName: string): void => {
    const handlers = this.events[eventName];

    if (!handlers || handlers.length === 0) {
      return;
    }

    handlers.forEach(callback => {
      callback();
    });
  };

  off = (eventName: string, callback: Callback): void => {
    const handlers = this.events[eventName];
    if (!handlers) return;
    this.events[eventName] = handlers.filter(handler => handler !== callback);
  };

  clear = (eventName: string): void => {
    if (this.events[eventName]) {
      delete this.events[eventName];
    }
  };
}
