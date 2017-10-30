import {Component, ViewEncapsulation, Inject, forwardRef} from 'angular2/core';
import template from './project-comments.html!text';
import TaskList from '../../comments/comments.js';
import Project from '../project.js';

@Component({
  selector: 'ngc-project-comments',
  template,
  encapsulation: ViewEncapsulation.None,
  directives: [TaskList]
})
export default class ProjectTaskList {
  constructor(@Inject(forwardRef(() => Project)) project) {
    this.project = project;
  }

  updateComments(comments) {
    this.project.updateComments(comments);
  }
}
