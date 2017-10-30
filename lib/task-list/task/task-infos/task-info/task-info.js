import {Component, Input, ViewEncapsulation, ChangeDetectionStrategy} from 'angular2/core';
import template from './task-info.html!text';

@Component({
  selector: 'ngc-task-info',
  host: {
    class: 'task-infos__info'
  },
  template,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class TaskInfo {
  @Input() title;
  @Input() info;

  isPresent() {
    return this.info != undefined;
  }
}
