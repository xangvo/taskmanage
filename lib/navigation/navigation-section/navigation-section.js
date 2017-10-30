import {Component, ViewEncapsulation, Input} from 'angular2/core';
import template from './navigation-section.html!text';
import NavigationItem from './navigation-item/navigation-item.js';

// This component creates a section within the navigation and lists navigation items
@Component({
  selector: 'ngc-navigation-section',
  host: {
    'class': 'navigation-section'
  },
  template,
  encapsulation: ViewEncapsulation.None,
  directives: [NavigationItem]
})
export default class NavigationSection {
  @Input() title;
  @Input() items;
}
