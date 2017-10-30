import {Component, ViewEncapsulation, Inject, forwardRef} from 'angular2/core';
import template from './project-task-list.html!text';
import TaskList from '../../task-list/task-list.js';
import Project from '../project.js';

@Component({
  selector: 'ngc-project-task-list',
  template,
  encapsulation: ViewEncapsulation.None,
  directives: [TaskList]
})
export default class ProjectTaskList {
  constructor(@Inject(forwardRef(() => Project)) project) {
    this.project = project;
  }

  updateTasks(tasks) {
    this.project.updateTasks(tasks);
  }
}
