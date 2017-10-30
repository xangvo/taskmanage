import {PluginConfig, PluginPlacement} from '../../lib/plugin/plugin.js';
import AgileTaskInfo from './agile-task-info/agile-task-info.js';
import AgileTaskDetail from './agile-task-detail/agile-task-detail.js';

@PluginConfig({
  name: 'agile',
  description: 'Agile development plugin to manage story points on tasks',
  // The placement information tells our plugin system where to register what plugin components
  placements: [
    new PluginPlacement({slot: 'TaskInfo', priority: 1, component: AgileTaskInfo}),
    new PluginPlacement({slot: 'TaskDetail', priority: 1, component: AgileTaskDetail})
  ]
})
export default class AgilePlugin {
  constructor() {
    // We're storing the available story points within the plugin itself where components can use the injected plugin to access them
    this.storyPoints = [0.5, 1, 2, 3, 5, 8, 13, 21];
  }
}
