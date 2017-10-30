import {Component, ViewEncapsulation, Inject} from 'angular2/core';
import {RouteConfig, Route, RouterOutlet} from 'angular2/router';
import ProjectService from './project/project-service/project-service.js';
import template from './app.html!text';
import Project from './project/project.js';
import ProjectsDashboard from './projects-dashboard/projects-dashboard.js';
import Navigation from './navigation/navigation.js';
import NavigationSection from './navigation/navigation-section/navigation-section.js';
import NavigationItem from './navigation/navigation-section/navigation-item/navigation-item.js';
import UserService from './user/user-service/user-service.js';
import ActivityService from './activities/activity-service/activity-service.js';
import TagsService from './tags/tags-service.js';
import ManagePlugins from './manage-plugins/manage-plugins.js';

// Our main application component will be responsible for fetching project data and rendering the main application components.
@Component({
  selector: 'ngc-app',
  template,
  encapsulation: ViewEncapsulation.None,
  directives: [Project, Navigation, NavigationSection, NavigationItem, RouterOutlet],
  providers: [ProjectService, UserService, ActivityService, TagsService]
})
@RouteConfig([
  new Route({ path: '/dashboard', component: ProjectsDashboard, name: 'ProjectsDashboard', useAsDefault: true}),
  new Route({ path: '/projects/:projectId/...', component: Project, name: 'ProjectDetails' }),
  new Route({ path: '/plugins', component: ManagePlugins, name: 'ManagePlugins'})
])
export default class App {
  // We use the data provider to obtain a data change observer
  constructor(@Inject(ProjectService) projectService) {
    this.projectService = projectService;
    this.projects = [];

    // Setting up our functional reactive subscription to receive project changes from the database
    this.projectsSubscription = projectService.change
      // We subscribe to the change observer of our service and deal with project changes in the function parameter
      .subscribe((projects) => {
        this.projects = projects;
        // We create new navigation items for our projects
        this.projectNavigationItems = this.projects
          // We first filter for projects that are not deleted
          .filter((project) => !project.deleted)
          .map((project) => {
            return {
              title: project.title,
              link: ['/ProjectDetails', {projectId: project._id}]
            };
          });
        // Uses functional reduce to get a count over open tasks across all projects
        this.openTaskCount = this.projects.reduce((count, project) => count + project.tasks.filter((task) => !task.done).length, 0);
      });
  }

  // If this component gets destroyed, we need to remember to clean up the project subscription
  ngOnDestroy() {
    this.projectsSubscription.unsubscribe();
  }
}
