import { Eventing } from '@/core/models/Eventing';

describe('Eventing', () => {
  let eventing: Eventing;

  beforeEach(() => {
    eventing = new Eventing();
  });

  it('should register and trigger an event', () => {
    const callback = jest.fn();
    eventing.on('testEvent', callback);

    eventing.trigger('testEvent');

    expect(callback).toHaveBeenCalled();
  });

  it('should not trigger an event if no handlers are registered', () => {
    const callback = jest.fn();

    eventing.trigger('testEvent');

    expect(callback).not.toHaveBeenCalled();
  });

  it('should unregister an event handler', () => {
    const callback = jest.fn();
    eventing.on('testEvent', callback);

    eventing.off('testEvent', callback);
    eventing.trigger('testEvent');

    expect(callback).not.toHaveBeenCalled();
  });

  it('should clear all event handlers for a given event', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    eventing.on('testEvent', callback1);
    eventing.on('testEvent', callback2);

    eventing.clear('testEvent');
    eventing.trigger('testEvent');

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });
});
