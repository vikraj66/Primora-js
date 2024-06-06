// routerBasicFunctionality.test.ts

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

describe('Router Basic Functionality', () => {
    it('should add a route correctly', () => {
        const handler: RouteHandler = jest.fn();
        router.addRoute('/test', handler);
        expect(router['routes']['/test'].handler).toBe(handler);
    });

    it('should navigate to a route', () => {
        const handler: RouteHandler = jest.fn();
        router.addRoute('/test', handler);
        router.navigate('/test');
        expect(window.history.pushState).toHaveBeenCalledWith({}, '', '/test');
        expect(handler).toHaveBeenCalled();
    });

    it('should load a route on popstate event', () => {
        const handler: RouteHandler = jest.fn();
        router.addRoute('/test', handler);
        router.navigate('/test');
        window.dispatchEvent(new PopStateEvent('popstate'));
        expect(handler).toHaveBeenCalled();
    });

    it('should handle non-existent routes gracefully', () => {
        const handler: RouteHandler = jest.fn();
        router.addRoute('/test', handler);
        router.navigate('/non-existent');
        expect(handler).not.toHaveBeenCalled();
    });

    it('should normalize the path correctly', () => {
        const handler: RouteHandler = jest.fn();
        router.addRoute('/test/', handler);
        router.navigate('/test');
        expect(handler).toHaveBeenCalled();
    });

    it('should apply scoped styles if enabled', () => {
        const handler: RouteHandler = jest.fn();
        const cssFilePath = 'styles.css';
        router.addRoute('/test', handler, cssFilePath, true);
        router.navigate('/test');
        expect(loadAndApplyScopedStyles).toHaveBeenCalledWith(expect.any(String), cssFilePath);
    });

    it('should add and execute global middleware', () => {
        const middleware: Middleware = jest.fn((params, next) => next());
        router.addGlobalMiddleware(middleware);
        const handler: RouteHandler = jest.fn();
        router.addRoute('/test', handler);
        router.navigate('/test');
        expect(middleware).toHaveBeenCalled();
    });

    it('should execute route-specific middleware', () => {
        const middleware: Middleware = jest.fn((params, next) => next());
        const handler: RouteHandler = jest.fn();
        router.addRoute('/test', handler, undefined, false, [middleware]);
        router.navigate('/test');
        expect(middleware).toHaveBeenCalled();
    });

    it('should apply global and route-specific middleware', () => {
        const globalMiddleware: Middleware = jest.fn((params, next) => next());
        const routeMiddleware: Middleware = jest.fn((params, next) => next());
        router.addGlobalMiddleware(globalMiddleware);
        const handler: RouteHandler = jest.fn();
        router.addRoute('/test', handler, undefined, false, [routeMiddleware]);
        router.navigate('/test');
        expect(globalMiddleware).toHaveBeenCalled();
        expect(routeMiddleware).toHaveBeenCalled();
    });

    it('should not call history.pushState when navigating to the same route twice', () => {
        const handler: RouteHandler = jest.fn();
        router.addRoute('/test', handler);
        router.navigate('/test');
        router.navigate('/test');
        expect(window.history.pushState).toHaveBeenCalledTimes(1);
    });
    
    
});
