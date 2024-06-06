/**
 * @jest-environment jsdom
 */
import { Router } from '@/router/Router';
import { Model } from '@/core/models/Model';
import { Attributes } from '@/core/models/Attributes';
import { Eventing } from '@/core/models/Eventing';
import { ApiSync } from '@/core/models/ApiSync';
import { View } from '@/core/views/View';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Interface for test properties
interface TestProps {
    id?: number;
    name?: string;
    age?: number;
}

// Setup mock for axios
const mock = new MockAdapter(axios);
const rootUrl = 'http://example.com/users';

// Define Test Model
class TestModel extends Model<TestProps> {}

// Define Test View
class TestView extends View<TestModel, TestProps> {
    template(): string {
        return `<div class="view-element">${this.model.get('name')}</div>`;
    }
}

describe('Complex Integration Tests for Router, Model, and View', () => {
    let attributes: Attributes<TestProps>;
    let eventing: Eventing;
    let sync: ApiSync<TestProps>;
    let model: TestModel;
    let router: Router;
    let parentElement: HTMLElement;

    beforeEach(() => {
        attributes = new Attributes<TestProps>({ id: 1, name: 'John Doe', age: 30 });
        eventing = new Eventing();
        sync = new ApiSync<TestProps>(rootUrl);
        model = new TestModel(attributes, eventing, sync);
        router = new Router();
        parentElement = document.createElement('div');
        document.body.appendChild(parentElement);
    });

    afterEach(() => {
        document.body.removeChild(parentElement);
        mock.reset();
        jest.clearAllMocks();
    });

    it('should handle nested routes correctly', () => {
        const userRouteHandler = jest.fn();
        const userDetailsHandler = jest.fn();

        router.addRoute('/user', userRouteHandler);
        router.addRoute('/user/:id/details', userDetailsHandler);

        router.navigate('/user');
        expect(userRouteHandler).toHaveBeenCalled();

        router.navigate('/user/123/details');
        expect(userDetailsHandler).toHaveBeenCalledWith({ id: '123' });
    });

    it('should handle dynamic route parameters', () => {
        const handler = jest.fn();

        router.addRoute('/product/:category/:id', handler);
        router.navigate('/product/electronics/456');

        expect(handler).toHaveBeenCalledWith({ category: 'electronics', id: '456' });
    });

    it('should execute global middleware and route-specific middleware', () => {
        const globalMiddleware = jest.fn((params, next) => next());
        const routeMiddleware = jest.fn((params, next) => next());
        const handler = jest.fn();

        router.addGlobalMiddleware(globalMiddleware);
        router.addRoute('/admin', handler, undefined, false, [routeMiddleware]);

        router.navigate('/admin');
        expect(globalMiddleware).toHaveBeenCalled();
        expect(routeMiddleware).toHaveBeenCalled();
        expect(handler).toHaveBeenCalled();
    });

    it('should correctly navigate with query parameters', () => {
        const handler = jest.fn();

        router.addRoute('/search', handler);
        router.navigate('/search?q=router+test');

        expect(handler).toHaveBeenCalled();
    });

    it('should correctly navigate with hash fragments', () => {
        const handler = jest.fn();

        router.addRoute('/about', handler);
        router.navigate('/about#team');

        expect(handler).toHaveBeenCalled();
    });

    it('should apply multiple middlewares correctly', () => {
        const middleware1 = jest.fn((params, next) => next());
        const middleware2 = jest.fn((params, next) => next());
        const handler = jest.fn();

        router.addGlobalMiddleware(middleware1);
        router.addRoute('/profile', handler, undefined, false, [middleware2]);

        router.navigate('/profile');
        expect(middleware1).toHaveBeenCalled();
        expect(middleware2).toHaveBeenCalled();
        expect(handler).toHaveBeenCalled();
    });

    // it('should handle async middlewares', async () => {
    //     const asyncMiddleware = jest.fn(async (params, next) => {
    //         await new Promise(resolve => setTimeout(resolve, 100));
    //         next();
    //     });
    //     const handler = jest.fn();

    //     router.addRoute('/async', handler, undefined, false, [asyncMiddleware]);

    //     await router.navigate('/async');
    //     expect(asyncMiddleware).toHaveBeenCalled();
    //     expect(handler).toHaveBeenCalled();
    // });

    it('should handle nested dynamic routes', () => {
        const handler = jest.fn();

        router.addRoute('/section/:sectionId/page/:pageId', handler);
        router.navigate('/section/10/page/5');

        expect(handler).toHaveBeenCalledWith({ sectionId: '10', pageId: '5' });
    });

    it('should handle query parameters and route parameters together', () => {
        const handler = jest.fn();

        router.addRoute('/items/:id', handler);
        router.navigate('/items/42?filter=new');

        expect(handler).toHaveBeenCalledWith({ id: '42' });
    });

    it('should handle multiple route levels', () => {
        const handler = jest.fn();

        router.addRoute('/level1/level2/level3', handler);
        router.navigate('/level1/level2/level3');

        expect(handler).toHaveBeenCalled();
    });



    it('should handle navigation within nested routes', () => {
        const parentHandler = jest.fn();
        const childHandler = jest.fn();

        router.addRoute('/parent', parentHandler);
        router.addRoute('/parent/child', childHandler);

        router.navigate('/parent');
        router.navigate('/parent/child');

        expect(parentHandler).toHaveBeenCalled();
        expect(childHandler).toHaveBeenCalled();
    });

    it('should execute route-specific middleware correctly', () => {
        const routeMiddleware = jest.fn((params, next) => next());
        const handler = jest.fn();

        router.addRoute('/middleware', handler, undefined, false, [routeMiddleware]);

        router.navigate('/middleware');
        expect(routeMiddleware).toHaveBeenCalled();
        expect(handler).toHaveBeenCalled();
    });

    it('should handle multiple query parameters', () => {
        const handler = jest.fn();

        router.addRoute('/search', handler);
        router.navigate('/search?query=test&sort=asc');

        expect(handler).toHaveBeenCalled();
    });



    it('should correctly navigate back and forward in history', () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();

        router.addRoute('/page1', handler1);
        router.addRoute('/page2', handler2);

        router.navigate('/page1');
        router.navigate('/page2');
        history.back();

        expect(handler1).toHaveBeenCalled();
        expect(handler2).toHaveBeenCalled();
    });

    

    it('should handle multiple middleware layers', () => {
        const middleware1 = jest.fn((params, next) => next());
        const middleware2 = jest.fn((params, next) => next());
        const handler = jest.fn();

        router.addGlobalMiddleware(middleware1);
        router.addGlobalMiddleware(middleware2);
        router.addRoute('/multiple', handler);

        router.navigate('/multiple');
        expect(middleware1).toHaveBeenCalled();
        expect(middleware2).toHaveBeenCalled();
        expect(handler).toHaveBeenCalled();
    });

    it('should handle nested routes with multiple parameters', () => {
        const handler = jest.fn();

        router.addRoute('/parent/:parentId/child/:childId', handler);
        router.navigate('/parent/1/child/2');

        expect(handler).toHaveBeenCalledWith({ parentId: '1', childId: '2' });
    });
});
