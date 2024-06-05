/*
  @jest-environment node
*/
import { Model } from '@/core/models/Model';
import { Attributes } from '@/core/models/Attributes';
import { Eventing } from '@/core/models/Eventing';
import { ApiSync } from '@/core/models/ApiSync';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

interface TestProps {
  id?: number;
  name?: string;
  age?: number;
}

describe('Model', () => {
  let attributes: Attributes<TestProps>;
  let eventing: Eventing;
  let sync: ApiSync<TestProps>;
  let model: Model<TestProps>;
  const rootUrl = 'http://example.com/users';
  const mock = new MockAdapter(axios);

  beforeEach(() => {
    attributes = new Attributes<TestProps>({ id: 1, name: 'John Doe', age: 30 });
    eventing = new Eventing();
    sync = new ApiSync<TestProps>(rootUrl);
    model = new Model<TestProps>(attributes, eventing, sync);
  });

  afterEach(() => {
    mock.reset();
    jest.clearAllMocks(); // Clear all mocks after each test
  });

  it('should set attributes correctly', () => {
    model.set({ name: 'Jane Doe' });
    expect(model.get('name')).toBe('Jane Doe');
  });

  it('should trigger change event when attributes are set', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const callback = () => console.log('Change event triggered');
    model.on('change', callback);
    model.set({ name: 'Jane Doe' });

    expect(logSpy).toHaveBeenCalledWith('Change event triggered');
    logSpy.mockRestore();
  });

  it('should fetch data from API and update attributes', async () => {
    const data = { id: 1, name: 'Jane Doe', age: 25 };
    mock.onGet(`${rootUrl}/1`).reply(200, data);

    await model.fetch();

    expect(model.get('name')).toBe('Jane Doe');
    expect(model.get('age')).toBe(25);
  });

  it('should handle fetch errors gracefully', async () => {
    mock.onGet(`${rootUrl}/1`).reply(500);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    model.on('error', () => console.log('Error event triggered'));
    await expect(model.fetch()).rejects.toThrow();

    expect(logSpy).toHaveBeenCalledWith('Error event triggered');
    logSpy.mockRestore();
  });

  
  

  it('should save data to the API and trigger save event', async () => {
    const data = { id: 1, name: 'Jane Doe', age: 25 };
    mock.onPut(`${rootUrl}/1`).reply(200, data);
  
    // Spies for specific log messages
    const saveEventSpy = jest.fn();
    const errorEventSpy = jest.fn();
  
    // Attach the spies to the events
    model.on('save', saveEventSpy);
    model.on('error', errorEventSpy);
  
    console.log('Before save call');
    await model.save();
    console.log('After save call');
  
    expect(saveEventSpy).toHaveBeenCalled();
    expect(errorEventSpy).not.toHaveBeenCalled();
  });
  
});
