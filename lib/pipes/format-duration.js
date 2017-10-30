import {Pipe, Inject} from 'angular2/core';
import Moment from 'moment';
import {formatDuration} from '../utilities/time-utilities.js';

@Pipe({
  // Specifying the name to be used within templates
  name: 'formatDuration'
})
export default class FormatDurationPipe {
  // The transform method will be called when the pipe is used within a template
  transform(value) {
    if (value == null || typeof value !== 'number') {
      return value;
    }

    return formatDuration(value);
  }
}
