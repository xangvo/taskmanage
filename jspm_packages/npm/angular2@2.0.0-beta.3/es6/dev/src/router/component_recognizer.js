/* */ 
"format cjs";
import { isBlank, isPresent } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Map } from 'angular2/src/facade/collection';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { RouteRecognizer, RedirectRecognizer, PathMatch } from './route_recognizer';
import { Route, AsyncRoute, AuxRoute, Redirect } from './route_config_impl';
import { AsyncRouteHandler } from './async_route_handler';
import { SyncRouteHandler } from './sync_route_handler';
/**
 * `ComponentRecognizer` is responsible for recognizing routes for a single component.
 * It is consumed by `RouteRegistry`, which knows how to recognize an entire hierarchy of
 * components.
 */
export class ComponentRecognizer {
    constructor() {
        this.names = new Map();
        // map from name to recognizer
        this.auxNames = new Map();
        // map from starting path to recognizer
        this.auxRoutes = new Map();
        // TODO: optimize this into a trie
        this.matchers = [];
        this.defaultRoute = null;
    }
    /**
     * returns whether or not the config is terminal
     */
    config(config) {
        var handler;
        if (isPresent(config.name) && config.name[0].toUpperCase() != config.name[0]) {
            var suggestedName = config.name[0].toUpperCase() + config.name.substring(1);
            throw new BaseException(`Route "${config.path}" with name "${config.name}" does not begin with an uppercase letter. Route names should be CamelCase like "${suggestedName}".`);
        }
        if (config instanceof AuxRoute) {
            handler = new SyncRouteHandler(config.component, config.data);
            let path = config.path.startsWith('/') ? config.path.substring(1) : config.path;
            var recognizer = new RouteRecognizer(config.path, handler);
            this.auxRoutes.set(path, recognizer);
            if (isPresent(config.name)) {
                this.auxNames.set(config.name, recognizer);
            }
            return recognizer.terminal;
        }
        var useAsDefault = false;
        if (config instanceof Redirect) {
            let redirector = new RedirectRecognizer(config.path, config.redirectTo);
            this._assertNoHashCollision(redirector.hash, config.path);
            this.matchers.push(redirector);
            return true;
        }
        if (config instanceof Route) {
            handler = new SyncRouteHandler(config.component, config.data);
            useAsDefault = isPresent(config.useAsDefault) && config.useAsDefault;
        }
        else if (config instanceof AsyncRoute) {
            handler = new AsyncRouteHandler(config.loader, config.data);
            useAsDefault = isPresent(config.useAsDefault) && config.useAsDefault;
        }
        var recognizer = new RouteRecognizer(config.path, handler);
        this._assertNoHashCollision(recognizer.hash, config.path);
        if (useAsDefault) {
            if (isPresent(this.defaultRoute)) {
                throw new BaseException(`Only one route can be default`);
            }
            this.defaultRoute = recognizer;
        }
        this.matchers.push(recognizer);
        if (isPresent(config.name)) {
            this.names.set(config.name, recognizer);
        }
        return recognizer.terminal;
    }
    _assertNoHashCollision(hash, path) {
        this.matchers.forEach((matcher) => {
            if (hash == matcher.hash) {
                throw new BaseException(`Configuration '${path}' conflicts with existing route '${matcher.path}'`);
            }
        });
    }
    /**
     * Given a URL, returns a list of `RouteMatch`es, which are partial recognitions for some route.
     */
    recognize(urlParse) {
        var solutions = [];
        this.matchers.forEach((routeRecognizer) => {
            var pathMatch = routeRecognizer.recognize(urlParse);
            if (isPresent(pathMatch)) {
                solutions.push(pathMatch);
            }
        });
        // handle cases where we are routing just to an aux route
        if (solutions.length == 0 && isPresent(urlParse) && urlParse.auxiliary.length > 0) {
            return [PromiseWrapper.resolve(new PathMatch(null, null, urlParse.auxiliary))];
        }
        return solutions;
    }
    recognizeAuxiliary(urlParse) {
        var routeRecognizer = this.auxRoutes.get(urlParse.path);
        if (isPresent(routeRecognizer)) {
            return [routeRecognizer.recognize(urlParse)];
        }
        return [PromiseWrapper.resolve(null)];
    }
    hasRoute(name) { return this.names.has(name); }
    componentLoaded(name) {
        return this.hasRoute(name) && isPresent(this.names.get(name).handler.componentType);
    }
    loadComponent(name) {
        return this.names.get(name).handler.resolveComponentType();
    }
    generate(name, params) {
        var pathRecognizer = this.names.get(name);
        if (isBlank(pathRecognizer)) {
            return null;
        }
        return pathRecognizer.generate(params);
    }
    generateAuxiliary(name, params) {
        var pathRecognizer = this.auxNames.get(name);
        if (isBlank(pathRecognizer)) {
            return null;
        }
        return pathRecognizer.generate(params);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X3JlY29nbml6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL2NvbXBvbmVudF9yZWNvZ25pemVyLnRzIl0sIm5hbWVzIjpbIkNvbXBvbmVudFJlY29nbml6ZXIiLCJDb21wb25lbnRSZWNvZ25pemVyLmNvbnN0cnVjdG9yIiwiQ29tcG9uZW50UmVjb2duaXplci5jb25maWciLCJDb21wb25lbnRSZWNvZ25pemVyLl9hc3NlcnROb0hhc2hDb2xsaXNpb24iLCJDb21wb25lbnRSZWNvZ25pemVyLnJlY29nbml6ZSIsIkNvbXBvbmVudFJlY29nbml6ZXIucmVjb2duaXplQXV4aWxpYXJ5IiwiQ29tcG9uZW50UmVjb2duaXplci5oYXNSb3V0ZSIsIkNvbXBvbmVudFJlY29nbml6ZXIuY29tcG9uZW50TG9hZGVkIiwiQ29tcG9uZW50UmVjb2duaXplci5sb2FkQ29tcG9uZW50IiwiQ29tcG9uZW50UmVjb2duaXplci5nZW5lcmF0ZSIsIkNvbXBvbmVudFJlY29nbml6ZXIuZ2VuZXJhdGVBdXhpbGlhcnkiXSwibWFwcGluZ3MiOiJPQUFPLEVBQUMsT0FBTyxFQUFFLFNBQVMsRUFBQyxNQUFNLDBCQUEwQjtPQUNwRCxFQUFDLGFBQWEsRUFBbUIsTUFBTSxnQ0FBZ0M7T0FDdkUsRUFBQyxHQUFHLEVBQTRDLE1BQU0sZ0NBQWdDO09BQ3RGLEVBQVUsY0FBYyxFQUFDLE1BQU0sMkJBQTJCO09BRTFELEVBRUwsZUFBZSxFQUNmLGtCQUFrQixFQUVsQixTQUFTLEVBQ1YsTUFBTSxvQkFBb0I7T0FDcEIsRUFBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQWtCLE1BQU0scUJBQXFCO09BQ25GLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSx1QkFBdUI7T0FDaEQsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQjtBQUtyRDs7OztHQUlHO0FBQ0g7SUFBQUE7UUFDRUMsVUFBS0EsR0FBR0EsSUFBSUEsR0FBR0EsRUFBMkJBLENBQUNBO1FBRTNDQSw4QkFBOEJBO1FBQzlCQSxhQUFRQSxHQUFHQSxJQUFJQSxHQUFHQSxFQUEyQkEsQ0FBQ0E7UUFFOUNBLHVDQUF1Q0E7UUFDdkNBLGNBQVNBLEdBQUdBLElBQUlBLEdBQUdBLEVBQTJCQSxDQUFDQTtRQUUvQ0Esa0NBQWtDQTtRQUNsQ0EsYUFBUUEsR0FBeUJBLEVBQUVBLENBQUNBO1FBRXBDQSxpQkFBWUEsR0FBb0JBLElBQUlBLENBQUNBO0lBOEh2Q0EsQ0FBQ0E7SUE1SENEOztPQUVHQTtJQUNIQSxNQUFNQSxDQUFDQSxNQUF1QkE7UUFDNUJFLElBQUlBLE9BQU9BLENBQUNBO1FBRVpBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLEVBQUVBLElBQUlBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzdFQSxJQUFJQSxhQUFhQSxHQUFHQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxFQUFFQSxHQUFHQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1RUEsTUFBTUEsSUFBSUEsYUFBYUEsQ0FDbkJBLFVBQVVBLE1BQU1BLENBQUNBLElBQUlBLGdCQUFnQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsb0ZBQW9GQSxhQUFhQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUM3SkEsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsWUFBWUEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDL0JBLE9BQU9BLEdBQUdBLElBQUlBLGdCQUFnQkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsU0FBU0EsRUFBRUEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDOURBLElBQUlBLElBQUlBLEdBQUdBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1lBQ2hGQSxJQUFJQSxVQUFVQSxHQUFHQSxJQUFJQSxlQUFlQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtZQUMzREEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0E7WUFDckNBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMzQkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0E7WUFDN0NBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBLFFBQVFBLENBQUNBO1FBQzdCQSxDQUFDQTtRQUVEQSxJQUFJQSxZQUFZQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUV6QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsWUFBWUEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDL0JBLElBQUlBLFVBQVVBLEdBQUdBLElBQUlBLGtCQUFrQkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsRUFBRUEsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7WUFDeEVBLElBQUlBLENBQUNBLHNCQUFzQkEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsRUFBRUEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDMURBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO1lBQy9CQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNkQSxDQUFDQTtRQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxZQUFZQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsT0FBT0EsR0FBR0EsSUFBSUEsZ0JBQWdCQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxFQUFFQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUM5REEsWUFBWUEsR0FBR0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsSUFBSUEsTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0E7UUFDdkVBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLFlBQVlBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hDQSxPQUFPQSxHQUFHQSxJQUFJQSxpQkFBaUJBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQzVEQSxZQUFZQSxHQUFHQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQSxJQUFJQSxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQTtRQUN2RUEsQ0FBQ0E7UUFDREEsSUFBSUEsVUFBVUEsR0FBR0EsSUFBSUEsZUFBZUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFFM0RBLElBQUlBLENBQUNBLHNCQUFzQkEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsRUFBRUEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFFMURBLEVBQUVBLENBQUNBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pCQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDakNBLE1BQU1BLElBQUlBLGFBQWFBLENBQUNBLCtCQUErQkEsQ0FBQ0EsQ0FBQ0E7WUFD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QSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQSxRQUFRQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtJQUN6Q0EsQ0FBQ0E7QUFDSFYsQ0FBQ0E7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNCbGFuaywgaXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtNYXAsIE1hcFdyYXBwZXIsIExpc3RXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtQcm9taXNlLCBQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5cbmltcG9ydCB7XG4gIEFic3RyYWN0UmVjb2duaXplcixcbiAgUm91dGVSZWNvZ25pemVyLFxuICBSZWRpcmVjdFJlY29nbml6ZXIsXG4gIFJvdXRlTWF0Y2gsXG4gIFBhdGhNYXRjaFxufSBmcm9tICcuL3JvdXRlX3JlY29nbml6ZXInO1xuaW1wb3J0IHtSb3V0ZSwgQXN5bmNSb3V0ZSwgQXV4Um91dGUsIFJlZGlyZWN0LCBSb3V0ZURlZmluaXRpb259IGZyb20gJy4vcm91dGVfY29uZmlnX2ltcGwnO1xuaW1wb3J0IHtBc3luY1JvdXRlSGFuZGxlcn0gZnJvbSAnLi9hc3luY19yb3V0ZV9oYW5kbGVyJztcbmltcG9ydCB7U3luY1JvdXRlSGFuZGxlcn0gZnJvbSAnLi9zeW5jX3JvdXRlX2hhbmRsZXInO1xuaW1wb3J0IHtVcmx9IGZyb20gJy4vdXJsX3BhcnNlcic7XG5pbXBvcnQge0NvbXBvbmVudEluc3RydWN0aW9ufSBmcm9tICcuL2luc3RydWN0aW9uJztcblxuXG4vKipcbiAqIGBDb21wb25lbnRSZWNvZ25pemVyYCBpcyByZXNwb25zaWJsZSBmb3IgcmVjb2duaXppbmcgcm91dGVzIGZvciBhIHNpbmdsZSBjb21wb25lbnQuXG4gKiBJdCBpcyBjb25zdW1lZCBieSBgUm91dGVSZWdpc3RyeWAsIHdoaWNoIGtub3dzIGhvdyB0byByZWNvZ25pemUgYW4gZW50aXJlIGhpZXJhcmNoeSBvZlxuICogY29tcG9uZW50cy5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBvbmVudFJlY29nbml6ZXIge1xuICBuYW1lcyA9IG5ldyBNYXA8c3RyaW5nLCBSb3V0ZVJlY29nbml6ZXI+KCk7XG5cbiAgLy8gbWFwIGZyb20gbmFtZSB0byByZWNvZ25pemVyXG4gIGF1eE5hbWVzID0gbmV3IE1hcDxzdHJpbmcsIFJvdXRlUmVjb2duaXplcj4oKTtcblxuICAvLyBtYXAgZnJvbSBzdGFydGluZyBwYXRoIHRvIHJlY29nbml6ZXJcbiAgYXV4Um91dGVzID0gbmV3IE1hcDxzdHJpbmcsIFJvdXRlUmVjb2duaXplcj4oKTtcblxuICAvLyBUT0RPOiBvcHRpbWl6ZSB0aGlzIGludG8gYSB0cmllXG4gIG1hdGNoZXJzOiBBYnN0cmFjdFJlY29nbml6ZXJbXSA9IFtdO1xuXG4gIGRlZmF1bHRSb3V0ZTogUm91dGVSZWNvZ25pemVyID0gbnVsbDtcblxuICAvKipcbiAgICogcmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgY29uZmlnIGlzIHRlcm1pbmFsXG4gICAqL1xuICBjb25maWcoY29uZmlnOiBSb3V0ZURlZmluaXRpb24pOiBib29sZWFuIHtcbiAgICB2YXIgaGFuZGxlcjtcblxuICAgIGlmIChpc1ByZXNlbnQoY29uZmlnLm5hbWUpICYmIGNvbmZpZy5uYW1lWzBdLnRvVXBwZXJDYXNlKCkgIT0gY29uZmlnLm5hbWVbMF0pIHtcbiAgICAgIHZhciBzdWdnZXN0ZWROYW1lID0gY29uZmlnLm5hbWVbMF0udG9VcHBlckNhc2UoKSArIGNvbmZpZy5uYW1lLnN1YnN0cmluZygxKTtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgIGBSb3V0ZSBcIiR7Y29uZmlnLnBhdGh9XCIgd2l0aCBuYW1lIFwiJHtjb25maWcubmFtZX1cIiBkb2VzIG5vdCBiZWdpbiB3aXRoIGFuIHVwcGVyY2FzZSBsZXR0ZXIuIFJvdXRlIG5hbWVzIHNob3VsZCBiZSBDYW1lbENhc2UgbGlrZSBcIiR7c3VnZ2VzdGVkTmFtZX1cIi5gKTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnIGluc3RhbmNlb2YgQXV4Um91dGUpIHtcbiAgICAgIGhhbmRsZXIgPSBuZXcgU3luY1JvdXRlSGFuZGxlcihjb25maWcuY29tcG9uZW50LCBjb25maWcuZGF0YSk7XG4gICAgICBsZXQgcGF0aCA9IGNvbmZpZy5wYXRoLnN0YXJ0c1dpdGgoJy8nKSA/IGNvbmZpZy5wYXRoLnN1YnN0cmluZygxKSA6IGNvbmZpZy5wYXRoO1xuICAgICAgdmFyIHJlY29nbml6ZXIgPSBuZXcgUm91dGVSZWNvZ25pemVyKGNvbmZpZy5wYXRoLCBoYW5kbGVyKTtcbiAgICAgIHRoaXMuYXV4Um91dGVzLnNldChwYXRoLCByZWNvZ25pemVyKTtcbiAgICAgIGlmIChpc1ByZXNlbnQoY29uZmlnLm5hbWUpKSB7XG4gICAgICAgIHRoaXMuYXV4TmFtZXMuc2V0KGNvbmZpZy5uYW1lLCByZWNvZ25pemVyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZWNvZ25pemVyLnRlcm1pbmFsO1xuICAgIH1cblxuICAgIHZhciB1c2VBc0RlZmF1bHQgPSBmYWxzZTtcblxuICAgIGlmIChjb25maWcgaW5zdGFuY2VvZiBSZWRpcmVjdCkge1xuICAgICAgbGV0IHJlZGlyZWN0b3IgPSBuZXcgUmVkaXJlY3RSZWNvZ25pemVyKGNvbmZpZy5wYXRoLCBjb25maWcucmVkaXJlY3RUbyk7XG4gICAgICB0aGlzLl9hc3NlcnROb0hhc2hDb2xsaXNpb24ocmVkaXJlY3Rvci5oYXNoLCBjb25maWcucGF0aCk7XG4gICAgICB0aGlzLm1hdGNoZXJzLnB1c2gocmVkaXJlY3Rvcik7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnIGluc3RhbmNlb2YgUm91dGUpIHtcbiAgICAgIGhhbmRsZXIgPSBuZXcgU3luY1JvdXRlSGFuZGxlcihjb25maWcuY29tcG9uZW50LCBjb25maWcuZGF0YSk7XG4gICAgICB1c2VBc0RlZmF1bHQgPSBpc1ByZXNlbnQoY29uZmlnLnVzZUFzRGVmYXVsdCkgJiYgY29uZmlnLnVzZUFzRGVmYXVsdDtcbiAgICB9IGVsc2UgaWYgKGNvbmZpZyBpbnN0YW5jZW9mIEFzeW5jUm91dGUpIHtcbiAgICAgIGhhbmRsZXIgPSBuZXcgQXN5bmNSb3V0ZUhhbmRsZXIoY29uZmlnLmxvYWRlciwgY29uZmlnLmRhdGEpO1xuICAgICAgdXNlQXNEZWZhdWx0ID0gaXNQcmVzZW50KGNvbmZpZy51c2VBc0RlZmF1bHQpICYmIGNvbmZpZy51c2VBc0RlZmF1bHQ7XG4gICAgfVxuICAgIHZhciByZWNvZ25pemVyID0gbmV3IFJvdXRlUmVjb2duaXplcihjb25maWcucGF0aCwgaGFuZGxlcik7XG5cbiAgICB0aGlzLl9hc3NlcnROb0hhc2hDb2xsaXNpb24ocmVjb2duaXplci5oYXNoLCBjb25maWcucGF0aCk7XG5cbiAgICBpZiAodXNlQXNEZWZhdWx0KSB7XG4gICAgICBpZiAoaXNQcmVzZW50KHRoaXMuZGVmYXVsdFJvdXRlKSkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgT25seSBvbmUgcm91dGUgY2FuIGJlIGRlZmF1bHRgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZGVmYXVsdFJvdXRlID0gcmVjb2duaXplcjtcbiAgICB9XG5cbiAgICB0aGlzLm1hdGNoZXJzLnB1c2gocmVjb2duaXplcik7XG4gICAgaWYgKGlzUHJlc2VudChjb25maWcubmFtZSkpIHtcbiAgICAgIHRoaXMubmFtZXMuc2V0KGNvbmZpZy5uYW1lLCByZWNvZ25pemVyKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlY29nbml6ZXIudGVybWluYWw7XG4gIH1cblxuXG4gIHByaXZhdGUgX2Fzc2VydE5vSGFzaENvbGxpc2lvbihoYXNoOiBzdHJpbmcsIHBhdGgpIHtcbiAgICB0aGlzLm1hdGNoZXJzLmZvckVhY2goKG1hdGNoZXIpID0+IHtcbiAgICAgIGlmIChoYXNoID09IG1hdGNoZXIuaGFzaCkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgIGBDb25maWd1cmF0aW9uICcke3BhdGh9JyBjb25mbGljdHMgd2l0aCBleGlzdGluZyByb3V0ZSAnJHttYXRjaGVyLnBhdGh9J2ApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogR2l2ZW4gYSBVUkwsIHJldHVybnMgYSBsaXN0IG9mIGBSb3V0ZU1hdGNoYGVzLCB3aGljaCBhcmUgcGFydGlhbCByZWNvZ25pdGlvbnMgZm9yIHNvbWUgcm91dGUuXG4gICAqL1xuICByZWNvZ25pemUodXJsUGFyc2U6IFVybCk6IFByb21pc2U8Um91dGVNYXRjaD5bXSB7XG4gICAgdmFyIHNvbHV0aW9ucyA9IFtdO1xuXG4gICAgdGhpcy5tYXRjaGVycy5mb3JFYWNoKChyb3V0ZVJlY29nbml6ZXI6IEFic3RyYWN0UmVjb2duaXplcikgPT4ge1xuICAgICAgdmFyIHBhdGhNYXRjaCA9IHJvdXRlUmVjb2duaXplci5yZWNvZ25pemUodXJsUGFyc2UpO1xuXG4gICAgICBpZiAoaXNQcmVzZW50KHBhdGhNYXRjaCkpIHtcbiAgICAgICAgc29sdXRpb25zLnB1c2gocGF0aE1hdGNoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGhhbmRsZSBjYXNlcyB3aGVyZSB3ZSBhcmUgcm91dGluZyBqdXN0IHRvIGFuIGF1eCByb3V0ZVxuICAgIGlmIChzb2x1dGlvbnMubGVuZ3RoID09IDAgJiYgaXNQcmVzZW50KHVybFBhcnNlKSAmJiB1cmxQYXJzZS5hdXhpbGlhcnkubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIFtQcm9taXNlV3JhcHBlci5yZXNvbHZlKG5ldyBQYXRoTWF0Y2gobnVsbCwgbnVsbCwgdXJsUGFyc2UuYXV4aWxpYXJ5KSldO1xuICAgIH1cblxuICAgIHJldHVybiBzb2x1dGlvbnM7XG4gIH1cblxuICByZWNvZ25pemVBdXhpbGlhcnkodXJsUGFyc2U6IFVybCk6IFByb21pc2U8Um91dGVNYXRjaD5bXSB7XG4gICAgdmFyIHJvdXRlUmVjb2duaXplcjogUm91dGVSZWNvZ25pemVyID0gdGhpcy5hdXhSb3V0ZXMuZ2V0KHVybFBhcnNlLnBhdGgpO1xuICAgIGlmIChpc1ByZXNlbnQocm91dGVSZWNvZ25pemVyKSkge1xuICAgICAgcmV0dXJuIFtyb3V0ZVJlY29nbml6ZXIucmVjb2duaXplKHVybFBhcnNlKV07XG4gICAgfVxuXG4gICAgcmV0dXJuIFtQcm9taXNlV3JhcHBlci5yZXNvbHZlKG51bGwpXTtcbiAgfVxuXG4gIGhhc1JvdXRlKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5uYW1lcy5oYXMobmFtZSk7IH1cblxuICBjb21wb25lbnRMb2FkZWQobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaGFzUm91dGUobmFtZSkgJiYgaXNQcmVzZW50KHRoaXMubmFtZXMuZ2V0KG5hbWUpLmhhbmRsZXIuY29tcG9uZW50VHlwZSk7XG4gIH1cblxuICBsb2FkQ29tcG9uZW50KG5hbWU6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMubmFtZXMuZ2V0KG5hbWUpLmhhbmRsZXIucmVzb2x2ZUNvbXBvbmVudFR5cGUoKTtcbiAgfVxuXG4gIGdlbmVyYXRlKG5hbWU6IHN0cmluZywgcGFyYW1zOiBhbnkpOiBDb21wb25lbnRJbnN0cnVjdGlvbiB7XG4gICAgdmFyIHBhdGhSZWNvZ25pemVyOiBSb3V0ZVJlY29nbml6ZXIgPSB0aGlzLm5hbWVzLmdldChuYW1lKTtcbiAgICBpZiAoaXNCbGFuayhwYXRoUmVjb2duaXplcikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aFJlY29nbml6ZXIuZ2VuZXJhdGUocGFyYW1zKTtcbiAgfVxuXG4gIGdlbmVyYXRlQXV4aWxpYXJ5KG5hbWU6IHN0cmluZywgcGFyYW1zOiBhbnkpOiBDb21wb25lbnRJbnN0cnVjdGlvbiB7XG4gICAgdmFyIHBhdGhSZWNvZ25pemVyOiBSb3V0ZVJlY29nbml6ZXIgPSB0aGlzLmF1eE5hbWVzLmdldChuYW1lKTtcbiAgICBpZiAoaXNCbGFuayhwYXRoUmVjb2duaXplcikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aFJlY29nbml6ZXIuZ2VuZXJhdGUocGFyYW1zKTtcbiAgfVxufVxuIl19