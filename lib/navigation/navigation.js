import {Component, ViewEncapsulation, Input} from 'angular2/core';
import template from './navigation.html!text';
// The navigation component consists of the user area and navigation sections
import NavigationSection from './navigation-section/navigation-section.js';
import UserArea from '../user/user-area/user-area.js';

// This component represents the main navigation
@Component({
  selector: 'ngc-navigation',
  host: {
    'class': 'navigation'
  },
  template,
  encapsulation: ViewEncapsulation.None,
  directives: [NavigationSection, UserArea]
})
export default class Navigation {
  @Input() openTasksCount;
}
