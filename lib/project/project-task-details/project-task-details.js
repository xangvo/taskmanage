import {Component, ViewEncapsulation, Inject, forwardRef} from 'angular2/core';
import {RouteConfig, Route, RouteParams} from 'angular2/router';
import template from './project-task-details.html!text';
import Project from '../project.js';
import Editor from '../../ui/editor/editor.js';
import Efforts from '../../efforts/efforts.js';
import AutoComplete from '../../ui/auto-complete/auto-complete.js';
import PluginSlot from '../../plugin/plugin-slot.js';

@Component({
  selector: 'ngc-project-task-details',
  host: {
    class: 'task-details'
  },
  template,
  directives: [Editor, Efforts, AutoComplete, PluginSlot],
  encapsulation: ViewEncapsulation.None
})
export default class ProjectTaskDetails {
  constructor(@Inject(forwardRef(() => Project)) project, @Inject(RouteParams) routeParams) {
    this.project = project;
    this.nr = +routeParams.get('nr');
    this.projectChangeSubscription = project.document.change.subscribe((data) => {
      this.task = data.tasks.find((task) => task.nr === this.nr);
      this.projectMilestones = data.milestones || [];
    });
  }

  onTitleSaved(title) {
    this.task.title = title;
    this.project.document.persist();
  }

  onDescriptionSaved(description) {
    this.task.description = description;
    this.project.document.persist();
  }

  onEffortsChange(efforts) {
    if (!efforts.estimated && !efforts.effective) {
      this.task.efforts = null;
    } else {
      this.task.efforts = efforts;
    }
    this.project.document.persist();
  }

  onMilestoneSelected(milestone) {
    this.task.milestone = milestone;
    this.project.document.persist();
  }

  onMilestoneCreated(milestone) {
    this.project.document.data.milestones = this.project.document.data.milestones || [];
    this.project.document.data.milestones.push(milestone);
    this.task.milestone = milestone;
    this.project.document.persist();
  }

  ngOnDestroy() {
    this.projectChangeSubscription.unsubscribe();
  }
}
