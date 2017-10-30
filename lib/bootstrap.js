// Import Angular bootstrap function
import 'es6-shim';
import {bootstrap} from 'angular2/platform/browser';
import {provide} from 'angular2/core';
// Import router dependencies
import {ROUTER_PROVIDERS, HashLocationStrategy, LocationStrategy} from 'angular2/router';
// Providing our DataProvider on bootstrap
import DataProvider from '../data-access/data-provider.js';
import PluginService from './plugin/plugin-service.js';

// Import our main app component
import App from './app.js';

// We are bootstrapping Angular using our main application component
bootstrap(App, [
  DataProvider,
  PluginService,
  ROUTER_PROVIDERS,
  provide(LocationStrategy, {
    useClass: HashLocationStrategy
  })
]);
