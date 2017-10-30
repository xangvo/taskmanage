import {Component, Input, ViewEncapsulation, ChangeDetectionStrategy} from 'angular2/core';
import template from './task-infos.html!text';
import TaskInfo from './task-info/task-info.js';
import FormatEffortsPipe from '../../../pipes/format-efforts.js';
import CalendarTimePipe from '../../../pipes/calendar-time.js';
import PluginSlot from '../../../plugin/plugin-slot.js';

@Component({
  selector: 'ngc-task-infos',
  host: {
    'class': 'task-infos'
  },
  template,
  encapsulation: ViewEncapsulation.None,
  directives: [TaskInfo, PluginSlot],
  pipes: [FormatEffortsPipe, CalendarTimePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class TaskInfos {
  @Input() task;
}
