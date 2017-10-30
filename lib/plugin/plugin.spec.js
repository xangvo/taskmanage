import {describe, expect, it, inject, injectAsync, beforeEachProviders, TestComponentBuilder} from 'angular2/testing';
import {By} from 'angular2/platform/common_dom';
import {Component, Input, Injectable, provide} from 'angular2/core';
import {Subject} from 'rxjs/Rx';
import {PluginConfig, PluginPlacement} from './plugin.js';
import PluginService from './plugin-service.js'
import PluginSlot from './plugin-slot.js';

@Injectable()
export class MockPluginService extends PluginService {
  constructor() {
    super();
    this.change = {
      subscribe() {}
    };
  }

  loadPlugins() {}
}

@Component({
  selector: 'dummy-plugin-component-1',
  template: 'dummy1'
})
export class DummyPluginComponent1 {}

@Component({
  selector: 'dummy-plugin-component-2',
  template: 'dummy2'
})
export class DummyPluginComponent2 {}

@Component({
  selector: 'dummy-application',
  template: 'dummy-slot:<ngc-plugin-slot name="DummySlot"></ngc-plugin-slot>',
  directives: [PluginSlot]
})
export class DummyApplication {}

describe('PluginSlot', () => {
  beforeEachProviders(() => [
    provide(PluginService, {
      useClass: MockPluginService
    })
  ]);

  it('should create dummy component into designated slot',
    injectAsync([TestComponentBuilder, PluginService], (tcb, pluginService) => {
      return tcb
        .createAsync(DummyApplication).then((fixture) => {
          fixture.detectChanges();
          expect(fixture.nativeElement.textContent).toBe('dummy-slot:');

          @PluginConfig({
            name: 'dummy-plugin',
            description: 'Dummy Plugin',
            placements: [
              new PluginPlacement({slot: 'DummySlot', priority: 1, component: DummyPluginComponent1})
            ]
          })
          class DummyPlugin {}

          pluginService.plugins = [{
            type: DummyPlugin,
            config: DummyPlugin._pluginConfig,
            instance: new DummyPlugin()
          }];

          const pluginSlot = fixture.debugElement
            .query(By.directive(PluginSlot))
            .componentInstance;

          return pluginSlot.initialize().then(() => {
            fixture.detectChanges();
            expect(fixture.nativeElement.textContent).toBe('dummy-slot:dummy1');
          });
        });
    })
  );

  it('should create two dummy components of same plugin into designated slot respecting priority',
    injectAsync([TestComponentBuilder, PluginService], (tcb, pluginService) => {
      return tcb
        .createAsync(DummyApplication).then((fixture) => {
          fixture.detectChanges();
          expect(fixture.nativeElement.textContent).toBe('dummy-slot:');

          @PluginConfig({
            name: 'dummy-plugin',
            description: 'Dummy Plugin',
            placements: [
              new PluginPlacement({slot: 'DummySlot', priority: 1, component: DummyPluginComponent1}),
              new PluginPlacement({slot: 'DummySlot', priority: 2, component: DummyPluginComponent2})
            ]
          })
          class DummyPlugin {}

          pluginService.plugins = [{
            type: DummyPlugin,
            config: DummyPlugin._pluginConfig,
            instance: new DummyPlugin()
          }];

          const pluginSlot = fixture.debugElement
            .query(By.directive(PluginSlot))
            .componentInstance;

          return pluginSlot.initialize().then(() => {
            fixture.detectChanges();
            expect(fixture.nativeElement.textContent).toBe('dummy-slot:dummy2dummy1');
          });
        });
    })
  );

  it('should create two dummy components of different plugins into designated slot respecting priority',
    injectAsync([TestComponentBuilder, PluginService], (tcb, pluginService) => {
      return tcb
        .createAsync(DummyApplication).then((fixture) => {
          fixture.detectChanges();
          expect(fixture.nativeElement.textContent).toBe('dummy-slot:');

          @PluginConfig({
            name: 'dummy-plugin',
            description: 'Dummy Plugin',
            placements: [
              new PluginPlacement({slot: 'DummySlot', priority: 1, component: DummyPluginComponent1})
            ]
          })
          class DummyPlugin1 {}

          @PluginConfig({
            name: 'dummy-plugin',
            description: 'Dummy Plugin',
            placements: [
              new PluginPlacement({slot: 'DummySlot', priority: 2, component: DummyPluginComponent2})
            ]
          })
          class DummyPlugin2 {}

          pluginService.plugins = [{
            type: DummyPlugin1,
            config: DummyPlugin1._pluginConfig,
            instance: new DummyPlugin1()
          }, {
            type: DummyPlugin2,
            config: DummyPlugin2._pluginConfig,
            instance: new DummyPlugin2()
          }];

          const pluginSlot = fixture.debugElement
            .query(By.directive(PluginSlot))
            .componentInstance;

          return pluginSlot.initialize()
            .then(() => {
              fixture.detectChanges();
              expect(fixture.nativeElement.textContent).toBe('dummy-slot:dummy2dummy1');
            });
        });
    })
  );

  it('should create two dummy components of same plugin into different slots',
    injectAsync([TestComponentBuilder, PluginService], (tcb, pluginService) => {
      const template = 'dummy-slot1:<ngc-plugin-slot name="DummySlot1"></ngc-plugin-slot>dummy-slot2:<ngc-plugin-slot name="DummySlot2"></ngc-plugin-slot>';

      return tcb
        .overrideTemplate(DummyApplication, template)
        .createAsync(DummyApplication).then((fixture) => {
          fixture.detectChanges();
          expect(fixture.nativeElement.textContent).toBe('dummy-slot1:dummy-slot2:');

          @PluginConfig({
            name: 'dummy-plugin',
            description: 'Dummy Plugin',
            placements: [
              new PluginPlacement({slot: 'DummySlot1', priority: 1, component: DummyPluginComponent1}),
              new PluginPlacement({slot: 'DummySlot2', priority: 1, component: DummyPluginComponent2})
            ]
          })
          class DummyPlugin {}

          pluginService.plugins = [{
            type: DummyPlugin,
            config: DummyPlugin._pluginConfig,
            instance: new DummyPlugin()
          }];

          const pluginSlots = fixture.debugElement
            .queryAll(By.directive(PluginSlot))
            .map((debugElement) => debugElement.componentInstance);

          return Promise.all(
            pluginSlots.map((pluginSlot) => pluginSlot.initialize())
          ).then(() => {
            fixture.detectChanges();
            expect(fixture.nativeElement.textContent).toBe('dummy-slot1:dummy1dummy-slot2:dummy2');
          });
        });
    })
  );
});
