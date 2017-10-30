import {Directive, Input, Inject, Injector, provide, ElementRef, DynamicComponentLoader} from 'angular2/core';
import {PluginData} from './plugin.js';
import PluginService from './plugin-service.js';

@Directive({
  selector: 'ngc-plugin-slot'
})
export default class PluginSlot {
  @Input() name;

  constructor(@Inject(ElementRef) elementRef, @Inject(DynamicComponentLoader) dcl, @Inject(PluginService) pluginService) {
    this.dcl = dcl;
    this.elementRef = elementRef;
    this.pluginService = pluginService;
    this.componentRefs = [];
    // Subscribing to changes on the plugin service and re-initialize slot if needed
    this.pluginChangeSubscription = this.pluginService.change.subscribe(() => this.initialize());
  }

  initialize() {
    // If we don't have a valid name input, we shall return
    if (!this.name) {
      return;
    }

    // If we have already references to components within the plugin slot, we dispose them and clear the list
    if (this.componentRefs.length > 0) {
      this.componentRefs.forEach((componentRef) => componentRef.dispose());
      this.componentRefs = [];
    }

    // Using the PluginService we can obtain all placement information relevant to this slot
    const pluginData = this.pluginService.getPluginData(this.name);
    // Using the placement priority to sort plugin components relevant to this slot
    pluginData.sort(
      (a, b) => a.placement.priority < b.placement.priority ?
        1 : a.placement.priority > b.placement.priority ? -1 : 0);

    // Instantiating all plugin components relevant to this slot
    return Promise.all(pluginData.map((pluginData) => this.instantiatePluginComponent(pluginData)));
  }

  // Method to instantiate a single component based on plugin placement information
  instantiatePluginComponent(pluginData) {
    // We're providing the current PluginPlacementData so it can be injected from plugin components
    const providers = Injector.resolve([
      provide(PluginData, {
        useValue: pluginData
      })
    ]);

    // Using the DynamicComponentLoader, we're loading the plugin component right next to the plugin slot element
    return this.dcl.loadNextToLocation(pluginData.placement.component, this.elementRef, providers)
      .then((componentRef) => {
        // When dealing with OnPush or Detached change detection strategies, we'd like to ensure that the newly created component gets a change detection
        componentRef.hostView.changeDetectorRef.markForCheck();
        this.componentRefs.push(componentRef);
      });
  }

  // If the name input changes, we need to re-initialize the plugin components
  ngOnChanges() {
    this.initialize();
  }

  ngOnDestroy() {
    this.pluginChangeSubscription.unsubscribe();
  }
}
