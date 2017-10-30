import {Component, ViewEncapsulation, Inject, ChangeDetectionStrategy} from 'angular2/core';
import {RouterLink} from 'angular2/router';
import template from './projects-dashboard.html!text';

import ProjectService from '../project/project-service/project-service.js';
import ProjectSummary from './project-summary/project-summary.js';
import TasksChart from './tasks-chart/tasks-chart.js';

@Component({
  selector: 'ngc-projects-dashboard',
  host: {
    class: 'projects-dashboard'
  },
  template,
  directives: [ProjectSummary, RouterLink, TasksChart],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Detached
})
export default class ProjectsDashboard {
  constructor(@Inject(ProjectService) projectService) {
    this.projects = projectService.change;
  }
}
