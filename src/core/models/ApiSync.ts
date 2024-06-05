import axios, { AxiosPromise, AxiosResponse } from 'axios';

export interface Syncable {
    id?: number;
}

export class ApiSync<T extends Syncable> {
    constructor(private rootUrl: string) {}

    fetch(id: number): AxiosPromise<T> {
        return axios.get(`${this.rootUrl}/${id}`).catch(this.handleError);
    }

    save(data: T): AxiosPromise<T> {
        const { id } = data;
        if (id) {
            return axios.put(`${this.rootUrl}/${id}`, data).catch(this.handleError);
        } else {
            return axios.post(this.rootUrl, data).catch(this.handleError);
        }
    }

    delete(id: number): AxiosPromise<void> {
        return axios.delete(`${this.rootUrl}/${id}`).catch(this.handleError);
    }

    private handleError(error: any): never {
        console.error('API Sync Error:', error);
        throw new Error('API Sync Error');
    }
}
