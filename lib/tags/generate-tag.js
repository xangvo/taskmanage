import Tag from './tag.js';
import {limitWithEllipsis} from '../utilities/string-utilities.js';
import Project from '../project/project.js';
export const TAG_TYPE_PROJECT = 'project';
export const TAG_TYPE_TASK = 'task';

// The generateTag function is responsible for generating new tag objects depending on the passed subject
export function generateTag(subject) {
  if (subject.type === TAG_TYPE_PROJECT) {
    // If we're dealing with a project here, we generate the according tag object
    const project = subject;
    const openTaskCount = project.tasks.filter((task) => !task.done).length;
    return new Tag(
      `#${project._id}`,
      `${limitWithEllipsis(project.title, 20)} (${openTaskCount} open tasks)`,
      `#/projects/${project._id}/tasks`,
      TAG_TYPE_PROJECT
    );
  } else if (subject.type === TAG_TYPE_TASK) {
    // If we're dealing with a task, we generate the according tag object
    return new Tag(
      `#${subject.project._id}-task-${subject.task.nr}`,
      `${limitWithEllipsis(subject.task.title, 20)} (${subject.task.done ? 'done' : 'open'})`,
      `#/projects/${subject.project._id}/task/${subject.task.nr}`,
      TAG_TYPE_TASK
    );
  }
}
