import {Component, Inject, ViewEncapsulation} from 'angular2/core';
import template from './project.html!text';
import Tabs from '../ui/tabs/tabs.js';
import ProjectTaskList from './project-task-list/project-task-list.js';
import ProjectComments from './project-comments/project-comments.js';
import ProjectActivities from './project-activities/project-activities.js';
import ProjectTaskDetails from './project-task-details/project-task-details.js';

import {RouteParams, RouteConfig, RouterOutlet, Route} from 'angular2/router';
import DataProvider from '../../data-access/data-provider.js';
import LiveDocument from '../../data-access/live-document.js';

// This component represents a project and displays project details
@Component({
  selector: 'ngc-project',
  host: {
    'class': 'project'
  },
  template,
  encapsulation: ViewEncapsulation.None,
  directives: [Tabs]
})
@RouteConfig([
  new Route({ path: '/tasks', component: ProjectTaskList, name: 'TaskList', useAsDefault: true}),
  new Route({ path: '/task/:nr', component: ProjectTaskDetails, name: 'TaskDetails'}),
  new Route({ path: '/comments', component: ProjectComments, name: 'Comments'}),
  new Route({ path: '/activities', component: ProjectActivities, name: 'Activities'})
])
export default class Project {
  constructor(@Inject(RouteParams) routeParams, @Inject(DataProvider) dataProvider) {
    this.id = routeParams.get('projectId');
    this.document = new LiveDocument(dataProvider, {
      type: 'project',
      _id: this.id
    });
    this.document.change.subscribe((data) => {
      this.title = data.title;
      this.description = data.description;
      this.tasks = data.tasks;
      this.comments = data.comments;
    });

    this.tabItems = [
      {title: 'Tasks', link: ['TaskList']},
      {title: 'Comments', link: ['Comments']},
      {title: 'Activities', link: ['Activities']}
    ];
  }

  // This function should be called if the task list of the project was updated
  updateTasks(tasks) {
    this.document.data.tasks = tasks;
    this.document.persist();
  }

  // This function should be called if the comments have been updated
  updateComments(comments) {
    this.document.data.comments = comments;
    this.document.persist();
  }

  ngOnDestroy() {
    this.document.unsubscribe();
  }
}
