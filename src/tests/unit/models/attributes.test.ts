import { Attributes } from '@/core/models/Attributes';

interface TestProps {
  id: number;
  name: string;
  age: number;
}

describe('Attributes', () => {
  let attrs: Attributes<TestProps>;

  beforeEach(() => {
    attrs = new Attributes<TestProps>({ id: 1, name: 'John', age: 30 });
  });

  it('should return a value for a valid key', () => {
    expect(attrs.get('name')).toBe('John');
  });

  it('should set a value and trigger a change event', () => {
    attrs.set({ name: 'Jane' } as TestProps);
    expect(attrs.get('name')).toBe('Jane');
  });

  it('should return all attributes', () => {
    expect(attrs.getAll()).toEqual({ id: 1, name: 'John', age: 30 });
  });

  it('should merge updates with existing data', () => {
    attrs.set({ age: 35 } as TestProps);
    expect(attrs.getAll()).toEqual({ id: 1, name: 'John', age: 35 });
  });

  it('should handle setting multiple attributes at once', () => {
    attrs.set({ name: 'Jane', age: 28 } as  TestProps);
    expect(attrs.getAll()).toEqual({ id: 1, name: 'Jane', age: 28 });
  });
});
