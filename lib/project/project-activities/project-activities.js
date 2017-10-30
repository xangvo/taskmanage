import {Component, ViewEncapsulation, Inject, forwardRef} from 'angular2/core';
import template from './project-activities.html!text';
import Activities from '../../activities/activities.js';
import Project from '../project.js';

@Component({
  selector: 'ngc-project-activities',
  template,
  encapsulation: ViewEncapsulation.None,
  directives: [Activities]
})
export default class ProjectTaskList {
  constructor(@Inject(forwardRef(() => Project)) project) {
    this.project = project;
  }
}
