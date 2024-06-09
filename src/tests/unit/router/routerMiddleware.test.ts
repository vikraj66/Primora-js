/**
 * @jest-environment jsdom
 */

import { Router, RouteHandler, Middleware } from '@/router/Router';

let router: Router;

beforeEach(() => {
    router = new Router();
    window.history.pushState = jest.fn();
    window.addEventListener = jest.fn();
    document.head.innerHTML = '';
});

describe('Middleware Router Tests', () => {
    it('should allow middleware to modify params', async () => {
        const handler: RouteHandler = jest.fn();
        const middleware: Middleware = jest.fn(async (params, next) => {
            params.modified = true;
            await next();
        });

        router.addRoute('/test', handler, undefined, false, [middleware]);
        await router.navigate('/test');
        expect(middleware).toHaveBeenCalled();
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({ modified: true }));
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

    it('should execute multiple middleware in sequence', async () => {
        const handler: RouteHandler = jest.fn();
        const middleware1: Middleware = jest.fn(async (params, next) => {
            params.step = 'one';
            await next();
        });
        const middleware2: Middleware = jest.fn(async (params, next) => {
            params.step += '-two';
            await next();
        });
        const middleware3: Middleware = jest.fn(async (params, next) => {
            params.step += '-three';
            await next();
        });

        router.addRoute('/test', handler, undefined, false, [middleware1, middleware2, middleware3]);
        await router.navigate('/test');
        expect(middleware1).toHaveBeenCalled();
        expect(middleware2).toHaveBeenCalled();
        expect(middleware3).toHaveBeenCalled();
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({ step: 'one-two-three' }));
    });

    // it('should stop execution if middleware throws an error', async () => {
    //     const handler: RouteHandler = jest.fn();
    //     const middleware1: Middleware = jest.fn(async (params, next) => {
    //         params.step = 'one';
    //         await next();
    //     });
    //     const middleware2: Middleware = jest.fn(async (params, next) => {
    //         throw new Error('Middleware error');
    //     });
    //     const middleware3: Middleware = jest.fn(async (params, next) => {
    //         params.step += '-three';
    //         await next();
    //     });

    //     router.addRoute('/test', handler, undefined, false, [middleware1, middleware2, middleware3]);
    //     await expect(router.navigate('/test')).rejects.toThrow('Middleware error');
    //     expect(middleware1).toHaveBeenCalled();
    //     expect(middleware2).toHaveBeenCalled();
    //     expect(middleware3).not.toHaveBeenCalled();
    //     expect(handler).not.toHaveBeenCalled();
    // });

    // it('should handle async middleware correctly', async () => {
    //     const handler: RouteHandler = jest.fn();
    //     const middleware1: Middleware = jest.fn(async (params, next) => {
    //         params.step = 'one';
    //         await new Promise(resolve => setTimeout(resolve, 100));
    //         await next();
    //     });
    //     const middleware2: Middleware = jest.fn(async (params, next) => {
    //         params.step += '-two';
    //         await new Promise(resolve => setTimeout(resolve, 100));
    //         await next();
    //     });
    
    //     // Register the route with the handler and middlewares
    //     router.addRoute('/test', handler, undefined, false, [middleware1, middleware2]);
    
    //     // Navigate to the route
    //     await router.navigate('/test');
    
    //     // Ensure both middleware functions were called
    //     expect(middleware1).toHaveBeenCalled();
    //     expect(middleware2).toHaveBeenCalled();
    
    //     // Ensure the route handler was called with the modified params
    //     expect(handler).toHaveBeenCalledWith(expect.objectContaining({ step: 'one-two' }));
    // });
    

    it('should handle global middleware correctly', async () => {
        const handler: RouteHandler = jest.fn();
        const globalMiddleware: Middleware = jest.fn(async (params, next) => {
            params.global = 'global';
            await next();
        });
        const routeMiddleware: Middleware = jest.fn(async (params, next) => {
            params.route = 'route';
            await next();
        });

        router.addGlobalMiddleware(globalMiddleware);
        router.addRoute('/test', handler, undefined, false, [routeMiddleware]);
        await router.navigate('/test');
        expect(globalMiddleware).toHaveBeenCalled();
        expect(routeMiddleware).toHaveBeenCalled();
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({ global: 'global', route: 'route' }));
    });
});
