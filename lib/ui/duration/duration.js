import {Component, Input, Output, ViewEncapsulation, EventEmitter, ChangeDetectionStrategy} from 'angular2/core';
import template from './duration.html!text';
import FormatDurationPipe from '../../pipes/format-duration.js';
import Editor from '../../ui/editor/editor.js';
import {parseDuration} from '../../utilities/time-utilities.js';

@Component({
  selector: 'ngc-duration',
  host: {
    'class': 'duration'
  },
  template,
  directives: [Editor],
  pipes: [FormatDurationPipe],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class Duration {
  @Input() duration;
  @Output() durationChange = new EventEmitter();

  onEditSaved(formattedDuration) {
    this.durationChange.next(formattedDuration ? parseDuration(formattedDuration) : null);
  }
}
