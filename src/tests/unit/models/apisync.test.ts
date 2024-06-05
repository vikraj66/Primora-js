import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ApiSync, Syncable } from '@/core/models/ApiSync';

interface TestProps extends Syncable {
  name: string;
  age: number;
}

describe('ApiSync', () => {
  const mock = new MockAdapter(axios);
  const rootUrl = 'http://example.com/users';
  const apiSync = new ApiSync<TestProps>(rootUrl);

  afterEach(() => {
    mock.reset();
  });

  it('should fetch a record', async () => {
    const data = { id: 1, name: 'John', age: 30 };
    mock.onGet(`${rootUrl}/1`).reply(200, data);

    const response = await apiSync.fetch(1);

    expect(response.data).toEqual(data);
  });

  it('should save a new record', async () => {
    const data = { name: 'John', age: 30 };
    mock.onPost(rootUrl).reply(200, { id: 1, ...data });

    const response = await apiSync.save(data);

    expect(response.data).toEqual({ id: 1, ...data });
  });

  it('should update an existing record', async () => {
    const data = { id: 1, name: 'John', age: 30 };
    mock.onPut(`${rootUrl}/1`).reply(200, data);

    const response = await apiSync.save(data);

    expect(response.data).toEqual(data);
  });

  it('should delete a record', async () => {
    mock.onDelete(`${rootUrl}/1`).reply(200);

    const response = await apiSync.delete(1);

    expect(response.status).toBe(200);
  });

  it('should handle API errors gracefully', async () => {
    mock.onGet(`${rootUrl}/1`).reply(500);

    await expect(apiSync.fetch(1)).rejects.toThrow('API Sync Error');
  });
});
