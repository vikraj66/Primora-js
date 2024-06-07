/**
 * @jest-environment jsdom
 */

import { Router, RouteHandler, Middleware } from '@/router/Router';
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

describe('Router Edge Cases', () => {
    it('should handle route with trailing slash', () => {
        const handler: RouteHandler = jest.fn();
        router.addRoute('/test', handler);
        router.navigate('/test/');
        expect(handler).toHaveBeenCalled();
    });

    it('should handle root route correctly', () => {
        const handler: RouteHandler = jest.fn();
        router.addRoute('/', handler);
        router.navigate('/');
        expect(handler).toHaveBeenCalled();
    });

    it('should handle route with query parameters and hash fragment', () => {
        const handler: RouteHandler = jest.fn();
        router.addRoute('/test', handler);
        router.navigate('/test?param=value#section');
        expect(handler).toHaveBeenCalled();
    });

    it('should execute middleware in sequence and stop on error', () => {
        const handler: RouteHandler = jest.fn();
        const middleware1: Middleware = jest.fn((params, next) => {
            params.middleware = 'one';
            next();
        });
        const middleware2: Middleware = jest.fn((params, next) => {
            throw new Error('Middleware error');
        });
        const middleware3: Middleware = jest.fn((params, next) => {
            params.middleware += 'three';
            next();
        });

        router.addRoute('/test', handler, undefined, false, [middleware1, middleware2, middleware3]);
        expect(() => router.navigate('/test')).toThrow('Middleware error');
        expect(middleware1).toHaveBeenCalled();
        expect(middleware2).toHaveBeenCalled();
        expect(middleware3).not.toHaveBeenCalled();
        expect(handler).not.toHaveBeenCalled();
    });

    it('should log an error for unmatched routes', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        router.navigate('/unmatched');
        expect(consoleSpy).toHaveBeenCalledWith('Route not found: /unmatched');
        consoleSpy.mockRestore();
    });

    it('should handle nested dynamic routes', () => {
        const handler: RouteHandler = jest.fn();
        router.addRoute('/test/:id/details', handler);
        router.navigate('/test/123/details');
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({ id: '123' }));
    });

    it('should handle routes with mixed static and dynamic segments', () => {
        const handler: RouteHandler = jest.fn();
        router.addRoute('/test/:id/static', handler);
        router.navigate('/test/123/static');
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({ id: '123' }));
    });

    it('should allow global middleware to modify params', () => {
        const handler: RouteHandler = jest.fn();
        const globalMiddleware: Middleware = jest.fn((params, next) => {
            params.modified = 'true';
            next();
        });

        router.addGlobalMiddleware(globalMiddleware);
        router.addRoute('/test', handler);
        router.navigate('/test');
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({ modified: 'true' }));
    });

    it('should correctly handle multiple route handlers for similar routes', () => {
        const handler1: RouteHandler = jest.fn();
        const handler2: RouteHandler = jest.fn();
        router.addRoute('/test/first', handler1);
        router.addRoute('/test/:id', handler2);

        router.navigate('/test/first');
        expect(handler1).toHaveBeenCalled();
        expect(handler2).not.toHaveBeenCalled();

        router.navigate('/test/123');
        expect(handler2).toHaveBeenCalledWith(expect.objectContaining({ id: '123' }));
    });

    it('should allow middleware to prevent route handler execution', () => {
        const handler: RouteHandler = jest.fn();
        const blockingMiddleware: Middleware = jest.fn((params, next) => {
            // Prevent further execution
        });

        router.addRoute('/test', handler, undefined, false, [blockingMiddleware]);
        router.navigate('/test');
        expect(blockingMiddleware).toHaveBeenCalled();
        expect(handler).not.toHaveBeenCalled();
    });
});
