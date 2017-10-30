import {Component, ViewEncapsulation, Input, HostBinding} from 'angular2/core';
import template from './activity.html!text';

import FromNow from '../../pipes/from-now.js';
import Tags from '../../pipes/tags.js';

@Component({
  selector: 'ngc-activity',
  host: {
    'class': 'activity'
  },
  template,
  encapsulation: ViewEncapsulation.None,
  // We are using the FromNow pipe to display relative times within our template
  pipes: [FromNow, Tags]
})
export default class Activity {
  @Input() activity;
  // Input that should be a string 'left' or 'right' and will determine the activity alignment using CSS
  @Input() alignment;
  @Input() @HostBinding('class.activity--start-mark') startMark;
  @Input() @HostBinding('class.activity--end-mark') endMark;

  // Function with that will tell us if the activity should be aligned to the right. It's used for setting a modifier class on the info element.
  isAlignedRight() {
    return this.alignment === 'right';
  }
}
