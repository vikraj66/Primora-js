import { AxiosPromise, AxiosResponse } from 'axios';

interface ModelAttributes<T> {
  set(value: T): void;
  getAll(): T;
  get<K extends keyof T>(key: K): T[K];
}

interface Sync<T> {
  fetch(id: number): AxiosPromise;
  save(data: T): AxiosPromise;
}

interface Events {
  on(eventName: string, callback: () => void): void;
  trigger(eventName: string): void;
}

interface HasId {
  id?: number;
}

export class Model<T extends HasId> {
  private defaultErrorCallback = () => {
    console.error('An error occurred while fetching or saving data.');
  };

  on: (eventName: string, callback: () => void) => void;
  trigger: (eventName: string) => void;
  get: <K extends keyof T>(key: K) => T[K];

  constructor(
    private attributes: ModelAttributes<T>,
    private events: Events,
    private sync: Sync<T>
  ) {
    this.on = this.events.on;
    this.trigger = this.events.trigger;
    this.get = this.attributes.get;

    // Register the default error callback
    this.on('error', this.defaultErrorCallback);
  }

  set(update: T): void {
    this.attributes.set(update);
    this.events.trigger('change');
  }

  async fetch(): Promise<void> {
    const id = this.get('id');

    if (typeof id !== 'number') {
      throw new Error('Cannot fetch without an id');
    }

    try {
      const response = await this.sync.fetch(id);
      this.set(response.data);
    } catch {
      this.trigger('error');
      throw new Error("An error occurred while fetching data");
    }
  }

  async save(): Promise<void> {
    try {
      const response = await this.sync.save(this.attributes.getAll());
      this.trigger('save');
    } catch (error) {
      this.trigger('error');
      throw new Error("An error occurred while saving data");
    }
  }

  toJson(): object {
    return this.attributes.getAll();
  }
}