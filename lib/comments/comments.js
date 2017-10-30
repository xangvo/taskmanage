import {Component, Inject, ViewEncapsulation, ViewChild, Inject, Input, Output, EventEmitter, ChangeDetectionStrategy} from 'angular2/core';
import template from './comments.html!text';
import Editor from '../ui/editor/editor.js';
import Comment from './comment/comment.js';
import UserService from '../user/user-service/user-service.js';

import ActivityService from '../activities/activity-service/activity-service.js';
import {limitWithEllipsis} from '../utilities/string-utilities.js';

import {generateTag} from '../tags/generate-tag.js';

import InfiniteScroll from '../infinite-scroll/infinite-scroll.js';

@Component({
  selector: 'ngc-comments',
  host: {
    'class': 'comments'
  },
  template,
  encapsulation: ViewEncapsulation.None,
  directives: [Comment, Editor, InfiniteScroll],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class Comments {
  // A list of comment objects
  @Input() comments;
  // Subject for logging activities
  @Input() activitySubject;
  // Event when the list of comments have been updated
  @Output() commentsUpdated = new EventEmitter();
  // We are using an editor for adding new comments and control it directly using a reference
  @ViewChild(Editor) newCommentEditor;

  // We're using the user service to obtain the currently logged in user
  constructor(@Inject(UserService) userService, @Inject(ActivityService) activityService) {
    this.userService = userService;
    this.activityService = activityService;
  }

  // Adding a new comment from the newCommentContent field that is bound to the editor content
  addNewComment() {
    const comments = this.comments ? this.comments.slice() : [];
    const content = this.newCommentEditor.getEditableContent();
    comments.splice(0, 0, {
      user: this.userService.currentUser,
      time: +new Date(),
      content
    });
    this.commentsUpdated.next(comments);
    // We reset the content of the editor
    this.newCommentEditor.setEditableContent('');
    // Creating an activity log for the added comment
    this.activityService.logActivity(
      this.activitySubject.id,
      'comments',
      'New comment was added',
      `A new comment "${limitWithEllipsis(content, 30)}" was added to ${generateTag(this.activitySubject.document.data).textTag}.`
    );
  }

  // This method deals with edited comments
  onCommentEdited(comment, content) {
    const comments = this.comments.slice();
    // If the comment was edited with e zero length content, we will delete the comment from the list
    if (content.length === 0) {
      const removed = comments.splice(comments.indexOf(comment), 1)[0];
      // Creating an activity log for the deleted comment
      this.activityService.logActivity(
        this.activitySubject.id,
        'comments',
        'Comment deleted',
        `The comment "${limitWithEllipsis(removed.content, 30)}" on ${generateTag(this.activitySubject.document.data).textTag} was deleted.`
      );
    } else {
      // Otherwise we're replacing the existing comment
      const oldComment = comments.splice(comments.indexOf(comment), 1, {
        user: comment.user,
        time: comment.time,
        content
      })[0];
      // Creating an activity log for the modified comment
      this.activityService.logActivity(
        this.activitySubject.id,
        'comments',
        'Comment edited',
        `The comment "${limitWithEllipsis(oldComment.content, 30)}" on ${generateTag(this.activitySubject.document.data).textTag} was edited.`
      );
    }
    // Emit event so the updated comment list can be persisted outside the component
    this.commentsUpdated.next(comments);
  }

  isNewCommentEmpty() {
    return this.newCommentEditor ? this.newCommentEditor.getEditableContent().length === 0 : true;
  }

  hasComments() {
    return this.comments && this.comments.length > 0;
  }
}
