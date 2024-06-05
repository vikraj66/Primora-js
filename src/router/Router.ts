import { loadAndApplyScopedStyles } from "../utils/scopedStyles";

export type RouteHandler = (params?: { [key: string]: string }) => void;

export const routes: { [key: string]: RouteHandler } = {};


export type RouteWithCssHandler = {
    handler: RouteHandler;
    cssFilePath?: string;
    scoped?: boolean;
};

export class Router {
    private routes: { [key: string]: RouteWithCssHandler } = {};
    private currentRoute: string = '';
    private scopedStylesEnabled: boolean;

    constructor(scopedStylesEnabled: boolean = true) {
        this.scopedStylesEnabled = scopedStylesEnabled;
        window.addEventListener('popstate', this.onPopState.bind(this));
        this.onLoad();
    }

    private onPopState(): void {
        this.loadRoute(location.pathname);
    }

    private onLoad(): void {
        this.loadRoute(location.pathname);
    }

    public addRoute(path: string, handler: RouteHandler, cssFilePath?: string, scoped?: boolean): void {
        this.routes[this.normalizePath(path)] = { handler, cssFilePath, scoped }; // Normalize paths
    }

    public navigate(path: string): void {
        history.pushState({}, '', path);
        this.loadRoute(path);
    }

    public loadRoute(path: string): void {
        const normalizedPath = this.normalizePath(path);
        const [route, params] = this.matchRoute(normalizedPath);
        if (route && this.routes[route]) {
            this.currentRoute = route; // Update the current route
            console.log(`Navigating to ${route} with params`, params); // Logging for debugging
            const { handler, cssFilePath, scoped } = this.routes[route];
            if (cssFilePath) {
                if (this.scopedStylesEnabled && scoped !== false) {
                    const uniqueId = `route-${route.replace(/\//g, '-')}`;
                    loadAndApplyScopedStyles(uniqueId, cssFilePath);
                } else {
                    this.loadCss(cssFilePath);
                }
            }
            handler(params);
        } else {
            console.error(`Route not found: ${normalizedPath}`);
        }
    }

    private normalizePath(path: string): string {
        return path.replace(/\/+$/, '') || '/'; // Remove trailing slashes, default to '/'
    }

    private matchRoute(path: string): [string, { [key: string]: string }] {
        for (const route of Object.keys(this.routes)) {
            const paramNames: string[] = [];
            const regexPath = route.replace(/:([^/]+)/g, (_, paramName) => {
                paramNames.push(paramName);
                return '([^/]+)';
            });

            const match = path.match(new RegExp(`^${regexPath}$`));
            if (match) {
                const params = paramNames.reduce((acc, paramName, index) => {
                    acc[paramName] = match[index + 1];
                    return acc;
                }, {} as { [key: string]: string });

                return [route, params];
            }
        }
        return [null, {}];
    }

    private loadCss(cssFilePath: string): void {
        const existingLink = document.querySelector(`link[data-route-css]`);
        if (existingLink) {
            existingLink.remove();
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssFilePath;
        link.setAttribute('data-route-css', 'true');
        document.head.appendChild(link);
    }

    public getCurrentRoute(): string {
        return this.currentRoute;
    }
}
