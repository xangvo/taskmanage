import {Pipe} from 'angular2/core';
import {limitWithEllipsis} from '../utilities/string-utilities.js';

@Pipe({
  // Specifying the name to be used within templates
  name: 'limitWithEllipsis'
})
export default class LimitWithEllipsisPipe {
  // The transform method will be called when the pipe is used within a template
  transform(value, limit = 20) {
    return limitWithEllipsis(value, limit);
  }
}
