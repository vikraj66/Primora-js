/**
 * @jest-environment jsdom
 */

import { Router, RouteHandler, Middleware } from '@/router/Router';
import { loadAndApplyScopedStyles } from '@/utils/scopedStyles';

jest.mock('@/utils/scopedStyles', () => ({
    loadAndApplyScopedStyles: jest.fn(),
}));

jest.setTimeout(30000); // Set timeout to 30 seconds

let router: Router;

beforeEach(() => {
    router = new Router();
    window.history.pushState = jest.fn();
    window.addEventListener = jest.fn();
    document.head.innerHTML = '';
});

describe('Router Edge Cases', () => {
    it('should handle route with trailing slash', async () => {
        const handler: RouteHandler = jest.fn();
        router.addRoute('/test', handler);
        await router.navigate('/test/');
        expect(handler).toHaveBeenCalled();
    });

    it('should handle root route correctly', async () => {
        const handler: RouteHandler = jest.fn();
        router.addRoute('/', handler);
        await router.navigate('/');
        expect(handler).toHaveBeenCalled();
    });

    it('should handle route with query parameters and hash fragment', async () => {
        const handler: RouteHandler = jest.fn();
        router.addRoute('/test', handler);
        await router.navigate('/test?param=value#section');
        expect(handler).toHaveBeenCalled();
    });

    // it('should execute middleware in sequence and stop on error', async () => {
    //     const handler: RouteHandler = jest.fn();
    //     const middleware1: Middleware = jest.fn(async (params, next) => {
    //         params.middleware = 'one';
    //         await next();
    //     });
    //     const middleware2: Middleware = jest.fn(async () => {
    //         throw new Error('Middleware error');
    //     });
    //     const middleware3: Middleware = jest.fn(async (params, next) => {
    //         params.middleware += 'three';
    //         await next();
    //     });
    
    //     router.addRoute('/test', handler, undefined, false, [middleware1, middleware2, middleware3]);
    
    //     try {
    //         await router.navigate('/test');
    //     } catch (error) {
    //         expect(error.message).toBe('Middleware error');
    //     }
    
    //     expect(middleware1).toHaveBeenCalled();
    //     expect(middleware2).toHaveBeenCalled();
    //     expect(middleware3).not.toHaveBeenCalled();
    //     expect(handler).not.toHaveBeenCalled();
    // });
    
    
    
    

    it('should log an error for unmatched routes', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        await router.navigate('/unmatched');
        expect(consoleSpy).toHaveBeenCalledWith('Route not found: /unmatched');
        consoleSpy.mockRestore();
    });

    it('should handle nested dynamic routes', async () => {
        const handler: RouteHandler = jest.fn();
        router.addRoute('/test/:id/details', handler);
        await router.navigate('/test/123/details');
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({ id: '123' }));
    });

    it('should handle routes with mixed static and dynamic segments', async () => {
        const handler: RouteHandler = jest.fn();
        router.addRoute('/test/:id/static', handler);
        await router.navigate('/test/123/static');
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({ id: '123' }));
    });

    it('should allow global middleware to modify params', async () => {
        const handler: RouteHandler = jest.fn();
        const globalMiddleware: Middleware = jest.fn(async (params, next) => {
            params.modified = 'true';
            await next();
        });

        router.addGlobalMiddleware(globalMiddleware);
        router.addRoute('/test', handler);
        await router.navigate('/test');
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({ modified: 'true' }));
    });

    it('should correctly handle multiple route handlers for similar routes', async () => {
        const handler1: RouteHandler = jest.fn();
        const handler2: RouteHandler = jest.fn();
        router.addRoute('/test/first', handler1);
        router.addRoute('/test/:id', handler2);

        await router.navigate('/test/first');
        expect(handler1).toHaveBeenCalled();
        expect(handler2).not.toHaveBeenCalled();

        await router.navigate('/test/123');
        expect(handler2).toHaveBeenCalledWith(expect.objectContaining({ id: '123' }));
    });

    it('should allow middleware to prevent route handler execution', async () => {
        const handler: RouteHandler = jest.fn();
        const blockingMiddleware: Middleware = jest.fn(async (params, next) => {
            // Prevent further execution
        });

        router.addRoute('/test', handler, undefined, false, [blockingMiddleware]);
        await router.navigate('/test');
        expect(blockingMiddleware).toHaveBeenCalled();
        expect(handler).not.toHaveBeenCalled();
    });
});
