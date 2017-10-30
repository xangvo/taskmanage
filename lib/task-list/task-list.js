import {Component, Inject, ViewEncapsulation, Input, Output, EventEmitter, ChangeDetectionStrategy} from 'angular2/core';
import template from './task-list.html!text';
import Task from './task/task.js';
import EnterTask from './enter-task/enter-task.js';
import Toggle from '../ui/toggle/toggle.js';

import ActivityService from '../activities/activity-service/activity-service.js';
import {limitWithEllipsis} from '../utilities/string-utilities.js';

import {generateTag} from '../tags/generate-tag.js';

import Draggable from '../draggable/draggable.js';
import DraggableDropZone from '../draggable/draggable-drop-zone.js';

import InfiniteScroll from '../infinite-scroll/infinite-scroll.js';

@Component({
  selector: 'ngc-task-list',
  host: {
    'class': 'task-list'
  },
  template,
  encapsulation: ViewEncapsulation.None,
  directives: [Task, EnterTask, Toggle, Draggable, DraggableDropZone, InfiniteScroll],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class TaskList {
  @Input() tasks;
  // Subject for logging activities
  @Input() activitySubject;
  // Event emitter for emitting an event once the task list has been changed
  @Output() tasksUpdated = new EventEmitter();

  constructor(@Inject(ActivityService) activityService) {
    this.taskFilterList = ['all', 'open', 'done'];
    this.selectedTaskFilter = 'all';
    this.activityService = activityService;
  }

  ngOnChanges(changes) {
    if (changes.tasks) {
      this.taskFilterChange(this.selectedTaskFilter);
    }
  }

  taskFilterChange(filter) {
    this.selectedTaskFilter = filter;
    this.filteredTasks = this.tasks ? this.tasks.filter((task) => {
      if (filter === 'all') {
        return true;
      } else if (filter === 'open') {
        return !task.done;
      } else {
        return task.done;
      }
    }) : [];
  }

  // We use the reference of the old task to updated one specific item within the task list.
  onTaskUpdated(task, updatedData) {
    const tasks = this.tasks.slice();
    const oldTask = tasks.splice(tasks.indexOf(task), 1, Object.assign({}, task, updatedData))[0];
    this.tasksUpdated.next(tasks);
    // Creating an activity log for the updated task
    this.activityService.logActivity(
      this.activitySubject.id,
      'tasks',
      'A task was updated',
      `The task "${limitWithEllipsis(oldTask.title, 30)}" was updated on ${generateTag(this.activitySubject.document.data).textTag}.`
    );
  }

  // Using the reference of a task, this function will remove it from the tasks list and send an update
  onTaskDeleted(task) {
    const tasks = this.tasks.slice();
    const removed = tasks.splice(tasks.indexOf(task), 1)[0];
    this.tasksUpdated.next(tasks);
    // Creating an activity log for the deleted task
    this.activityService.logActivity(
      this.activitySubject.id,
      'tasks',
      'A task was deleted',
      `The task "${limitWithEllipsis(removed.title, 30)}" was deleted from ${generateTag(this.activitySubject.document.data).textTag}.`
    );
  }

  // Function to add a new task
  addTask(title) {
    const tasks = this.tasks.slice();
    const nr = tasks.reduce((maxNr, task) => task.nr > maxNr ? task.nr : maxNr, 0) + 1;

    tasks.splice(tasks.length, 0, {
      nr,
      created: +new Date(),
      position: tasks.length,
      title,
      done: null
    });
    this.tasksUpdated.next(tasks);
    // Creating an activity log for the added task
    this.activityService.logActivity(
      this.activitySubject.id,
      'tasks',
      'A task was added',
      `A new task "${limitWithEllipsis(title, 30)}" was added to ${generateTag(this.activitySubject.document.data).textTag}.`
    );
  }

  onTaskDrop(source, target) {
    if (source.position === target.position) {
      return;
    }

    let tasks = this.tasks.slice();
    const sourceIndex = tasks.findIndex(
      (task) => task.position === source.position
    );
    const targetIndex = tasks.findIndex(
      (task) => task.position === target.position
    );
    tasks.splice(targetIndex, 0, tasks.splice(sourceIndex, 1)[0]);
    tasks = tasks.map((task, index) => {
      return Object.assign({}, task, {
        position: index
      });
    });
    this.tasksUpdated.next(tasks);

    this.activityService.logActivity(
      this.activitySubject.id,
      'tasks',
      'A task was moved',
      `The task "${limitWithEllipsis(source.title, 30)}" on ${generateTag(this.activitySubject.document.data).textTag} was moved to the position ${target.position + 1}.`
    );
  }
}
