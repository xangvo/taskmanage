import {Component, ViewEncapsulation, Input} from 'angular2/core';
import template from './tabs.html!text';

import {RouterOutlet, RouterLink} from 'angular2/router';

@Component({
  selector: 'ngc-tabs',
  host: {
    'class': 'tabs'
  },
  template,
  encapsulation: ViewEncapsulation.None,
  directives: [RouterOutlet, RouterLink]
})
export default class Tabs {
  @Input() items;
}
