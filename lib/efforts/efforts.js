import {Component, ViewEncapsulation, Input, Output, EventEmitter, ChangeDetectionStrategy} from 'angular2/core';
import template from './efforts.html!text';
import Duration from '../ui/duration/duration.js';
import EffortsTimeline from './efforts-timeline/efforts-timeline.js';

@Component({
  selector: 'ngc-efforts',
  host: {
    class: 'efforts'
  },
  template,
  directives: [Duration, EffortsTimeline],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class Efforts {
  @Input() estimated;
  @Input() effective;
  @Output() effortsChange = new EventEmitter();

  onEstimatedChange(estimated) {
    this.effortsChange.next({
      estimated,
      effective: this.effective
    });
  }

  onEffectiveChange(effective) {
    this.effortsChange.next({
      effective,
      estimated: this.estimated
    });
  }

  addEffectiveHours(hours) {
    this.effortsChange.next({
      effective: (this.effective || 0) + hours * 60 * 60 * 1000,
      estimated: this.estimated
    });
  }
}
