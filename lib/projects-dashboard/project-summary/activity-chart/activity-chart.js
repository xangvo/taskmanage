import {Component, ViewEncapsulation, ViewChild, ElementRef, Input} from 'angular2/core';
import template from './activity-chart.html!text';
import Chartist from 'chartist';

import {rasterize} from '../../../utilities/time-utilities.js';

@Component({
  selector: 'ngc-activity-chart',
  host: {
    'class': 'activity-chart'
  },
  template,
  encapsulation: ViewEncapsulation.None
})
export default class ActivityChart {
  @Input() activities;
  @ViewChild('chartContainer') chartContainer;

  ngOnChanges() {
    this.createOrUpdateChart();
  }

  ngAfterViewInit() {
    this.createOrUpdateChart();
  }

  createOrUpdateChart() {
    if (!this.activities || !this.chartContainer) {
      return;
    }

    const series = [
      rasterize(this.activities.map((activity) => {
        return {
          time: activity.time,
          weight: 1
        };
      }), 3600000, 24, +new Date())
    ];

    if (this.chart) {
      this.chart.update({
        series
      });
    } else {
      this.chart = new Chartist.Bar(this.chartContainer.nativeElement, {
        series
      }, {
        width: '100%',
        height: 60,
        axisY: {
          onlyInteger: true,
          showGrid: false,
          showLabel: false,
          offset: 0
        },
        axisX: {
          showGrid: false,
          showLabel: false,
          offset: 0
        },
        chartPadding: 0
      });

      this.chart.on('draw', (context) => {
        if (context.type === 'bar' && context.value.y === 0) {
          context.element.attr({
            y2: context.y2 - 1
          });
        }
      });
    }
  }
}
