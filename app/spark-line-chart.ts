import Chart, { dxChartOptions } from "devextreme/viz/chart";

export class SparklineChart extends Chart {
  constructor(container: Element, options: dxChartOptions | undefined) {
    super(container, {
      ...options,
      ...{
        width: '100%',
        height: 125,
        showGrid: false,
        animation: {
          enabled: false,
        },
        tooltip: {
          enabled: true,
        },
        commonAxisSettings: {
          visible: false,
          grid: {
            visible: false,
          },
          minorGrid: {
            visible: false,
          },
          label: {
            visible: false,
          },
          tick: {
            visible: false,
          },
          minorTick: {
            visible: false,
          },
        },
        argumentAxis: {
          argumentType: 'datetime',
        },
        series: [
          {
            name: 'cpuUsage',
            argumentField: 'time',
            valueField: 'value',
            type: 'spline',
            showInLegend: false,
            point: {
              visible: false,
            }
          },
        ],
      },
    });
  }
}
