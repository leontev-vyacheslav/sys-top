"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparklineChart = void 0;
var chart_1 = __importDefault(require("devextreme/viz/chart"));
var SparklineChart = /** @class */ (function (_super) {
    __extends(SparklineChart, _super);
    function SparklineChart(container, options) {
        return _super.call(this, container, __assign(__assign({}, options), {
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
        })) || this;
    }
    return SparklineChart;
}(chart_1.default));
exports.SparklineChart = SparklineChart;
