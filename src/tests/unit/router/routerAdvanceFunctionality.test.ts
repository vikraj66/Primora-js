/**
 * @jest-environment jsdom
 */

import { Router, RouteHandler, Middleware } from '@/router';
import { loadAndApplyScopedStyles } from '@/utils/scopedStyles';

jest.mock('@/utils/scopedStyles', () => ({
    loadAndApplyScopedStyles: jest.fn(),
}));

let router: Router;

beforeEach(() => {
    router = new Router();
    window.history.pushState = jest.fn();
    window.addEventListener = jest.fn();
    document.head.innerHTML = '';
});

describe('Router Advanced Functionality', () => {
    it('should execute middleware in the correct order', () => {
        const handler: RouteHandler = jest.fn();
        const middleware1: Middleware = jest.fn((params, next) => {
            params.order = (params.order || '') + '1';
            next();
        });
        const middleware2: Middleware = jest.fn((params, next) => {
            params.order += '2';
            next();
        });

        router.addRoute('/test', handler, undefined, false, [middleware1, middleware2]);
        router.navigate('/test');
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({ order: '12' }));
    });

    it('should apply scoped styles correctly', () => {
        const handler: RouteHandler = jest.fn();
        router.addRoute('/test', handler, 'styles.css', true);
        router.navigate('/test');
        expect(loadAndApplyScopedStyles).toHaveBeenCalledWith(expect.any(String), 'styles.css');
    });

    it('should handle route parameters correctly', () => {
        const handler: RouteHandler = jest.fn();
        router.addRoute('/test/:id', handler);
        router.navigate('/test/123');
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({ id: '123' }));
    });

    it('should handle multiple route parameters correctly', () => {
        const handler: RouteHandler = jest.fn();
        router.addRoute('/test/:id/:action', handler);
        router.navigate('/test/123/edit');
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({ id: '123', action: 'edit' }));
    });

    it('should execute global middleware before route-specific middleware', () => {
        const handler: RouteHandler = jest.fn();
        const globalMiddleware: Middleware = jest.fn((params, next) => {
            params.order = 'global';
            next();
        });
        const routeMiddleware: Middleware = jest.fn((params, next) => {
            params.order += '-route';
            next();
        });

        router.addGlobalMiddleware(globalMiddleware);
        router.addRoute('/test', handler, undefined, false, [routeMiddleware]);
        router.navigate('/test');
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({ order: 'global-route' }));
    });

    it('should load CSS file for the route', () => {
        const handler: RouteHandler = jest.fn();
        const cssFilePath = 'styles.css';
        router.addRoute('/test', handler, cssFilePath, false);
        router.navigate('/test');
        expect(document.querySelector(`link[href="${cssFilePath}"]`)).not.toBeNull();
    });

    it('should remove existing CSS file before loading new one', () => {
        const handler: RouteHandler = jest.fn();
        const cssFilePath1 = 'styles1.css';
        const cssFilePath2 = 'styles2.css';
        
        router.addRoute('/test1', handler, cssFilePath1, false);
        router.addRoute('/test2', handler, cssFilePath2, false);

        router.navigate('/test1');
        expect(document.querySelector(`link[href="${cssFilePath1}"]`)).not.toBeNull();
        
        router.navigate('/test2');
        expect(document.querySelector(`link[href="${cssFilePath1}"]`)).toBeNull();
        expect(document.querySelector(`link[href="${cssFilePath2}"]`)).not.toBeNull();
    });

    it('should correctly match routes with similar prefixes', () => {
        const handler1: RouteHandler = jest.fn();
        const handler2: RouteHandler = jest.fn();
        router.addRoute('/test', handler1);
        router.addRoute('/test/:id', handler2);
        router.navigate('/test/123');
        expect(handler1).not.toHaveBeenCalled();
        expect(handler2).toHaveBeenCalled();
    });

    it('should handle nested routes correctly', () => {
        const handler1: RouteHandler = jest.fn();
        const handler2: RouteHandler = jest.fn();
        router.addRoute('/test', handler1);
        router.addRoute('/test/nested', handler2);
        router.navigate('/test/nested');
        expect(handler1).not.toHaveBeenCalled();
        expect(handler2).toHaveBeenCalled();
    });

    it('should handle routes with query parameters', () => {
        const handler: RouteHandler = jest.fn();
        router.addRoute('/test', handler);
        router.navigate('/test?param=value');
        expect(handler).toHaveBeenCalled();
    });

    it('should handle routes with hash fragments', () => {
        const handler: RouteHandler = jest.fn();
        router.addRoute('/test', handler);
        router.navigate('/test#section');
        expect(handler).toHaveBeenCalled();
    });
});
