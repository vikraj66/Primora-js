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

  constructor(
    private attributes: ModelAttributes<T>,
    private events: Events,
    private sync: Sync<T>
  ) {
    // Register the default error callback
    this.on('error', this.defaultErrorCallback);
  }

  on = this.events.on;
  trigger = this.events.trigger;
  get = this.attributes.get;

  set(update: T): void {
    this.attributes.set(update);
    console.log("TRIGGER CHANGE", this.events)
    this.events.trigger('change');
  }

  async fetch(): Promise<void> {
    const id = this.get('id');
    
    console.log("MODEL_FETCH: PREVIOUS", this.toJson())

    if (typeof id !== 'number') {
      throw new Error('Cannot fetch without an id');
    }


    console.log("MODEL_FETCH", id, )
    try {
      const response = await this.sync.fetch(id);
      console.log("MODEL_FETCH: RESPONSE", response);
      this.set(response.data);
      console.log("MODEL_FETCH: SET", this.toJson());
    } catch {
      this.trigger('error');
      throw new Error("An error occurred while fetching data");
    }
  }

  async save(): Promise<void> {
    try {
      const response = await this.sync.save(this.attributes.getAll());
      console.log("MODEL_SAVE: RESPONSE", response);
      this.trigger('save');
    } catch (error) {
      console.log("MODEL_SAVE: ERROR", error);
      this.trigger('error');
      throw new Error("An error occurred while saving data");
    }
  }
  

  toJson(): object {
    return this.attributes.getAll();
  }
}
