"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainRenderedWindow = void 0;
var osu = __importStar(require("node-os-utils"));
require("datejs");
var electron_1 = require("electron");
var spark_line_chart_1 = require("./spark-line-chart");
var form_1 = __importDefault(require("devextreme/ui/form"));
var progress_bar_1 = __importDefault(require("devextreme/ui/progress_bar"));
var menu_1 = __importDefault(require("devextreme/ui/menu"));
var tab_panel_1 = __importDefault(require("devextreme/ui/tab_panel"));
Number.prototype.toFixedNumber = function (digits, base) {
    var pow = Math.pow(base || 10, digits);
    return Math.round(digits * pow) / pow;
};
var cpu = osu.cpu;
var mem = osu.mem;
var os = osu.os;
var MainRenderedWindow = /** @class */ (function () {
    function MainRenderedWindow() {
        var _this = this;
        this.settings = {
            cpuOverloading: 20,
            alertInterval: 60,
        };
        this.lastNotificationDateTime = null;
        this.cpuUsages = [];
        this.currentTheme = null;
        this.cpuUsageProgressBar = null;
        this.cpuFreeProgressBar = null;
        this.sparkline = null;
        this.sparklineIntervalTimer = null;
        this.buildMenu = function () {
            var themeList = [
                { text: 'Dark Teal theme', theme: 'material.teal.dark' },
                { text: 'Light Teal theme', theme: 'material.teal.light' },
                { text: 'Dark Orange theme', theme: 'material.orange.dark' },
                { text: 'Light Orange theme', theme: 'material.orange.light' },
            ];
            var themeMenuItems = themeList.map(function (t) {
                return {
                    text: t.text,
                    selectable: true,
                    commandName: 'theme',
                    data: t.theme
                };
            });
            var mainMenuContainerElement = document.querySelector('[data-core-main-menu]');
            if (mainMenuContainerElement) {
                new menu_1.default(mainMenuContainerElement, {
                    onItemClick: function (e) {
                        var commandName = e.itemData.commandName;
                        if (commandName === 'quit') {
                            electron_1.ipcRenderer.invoke('app:quit');
                        }
                        else if (commandName === 'theme') {
                            _this.currentTheme = e.itemData.data;
                            console.log(_this.currentTheme);
                            if (_this.currentTheme) {
                                // themes.current(this.currentTheme);
                                localStorage.setItem('currentTheme', _this.currentTheme);
                                if (_this.sparkline !== null) {
                                    _this.sparkline.option('commonSeriesSettings', {
                                        color: _this.currentTheme.indexOf('orange') > 0 ? 'orangered' : 'teal',
                                    });
                                }
                            }
                        }
                    },
                    items: [
                        {
                            icon: 'menu',
                            items: [
                                {
                                    text: 'About...',
                                    icon: 'preferences',
                                    beginGroup: true,
                                    commandName: 'about'
                                },
                                {
                                    text: 'Themes',
                                    icon: 'image',
                                    items: themeMenuItems,
                                },
                                {
                                    text: 'Quit',
                                    icon: 'export',
                                    commandName: 'quit'
                                },
                            ],
                        },
                    ],
                });
            }
            var closeMenuContainerElement = document.querySelector('[data-core-close-menu]');
            if (closeMenuContainerElement) {
                new menu_1.default(closeMenuContainerElement, {
                    onItemClick: function (e) {
                        if (e.itemData.commandName === 'hide')
                            electron_1.ipcRenderer.invoke('mainWindow:hide');
                    },
                    items: [
                        {
                            icon: 'close',
                            commandName: 'hide'
                        },
                    ],
                });
            }
        };
        this.buildTabPanel = function () {
            var tabPanelContainerElement = document.querySelector('.core-tab-panel');
            if (tabPanelContainerElement) {
                new tab_panel_1.default(tabPanelContainerElement, {
                    height: 60,
                    items: [
                        {
                            title: 'CPU',
                            icon: 'smalliconslayout',
                            selector: 'cpu',
                        },
                        {
                            title: 'SYSTEM INFO',
                            icon: 'info',
                            selector: 'system-info',
                        },
                        {
                            title: 'SETTINGS',
                            icon: 'preferences',
                            selector: 'settings',
                        },
                    ],
                    onTitleClick: function (e) {
                        document.querySelectorAll('[data-core-tabs] > *').forEach(function (item) {
                            item.style.display = 'none';
                        });
                        document.querySelector("[data-core-tab-".concat(e.itemData.selector, "]")).style.display = 'block';
                    },
                    onSelectionChanged: function (e) {
                        var selectedIndex = e.component.option('selectedIndex');
                        _this.dispose();
                        switch (selectedIndex) {
                            case 0: {
                                _this.buildCpuTabContent();
                                break;
                            }
                            case 1: {
                                _this.buildSystemInfoTabContent();
                                break;
                            }
                            case 2: {
                                _this.buildSettingsTab();
                                break;
                            }
                            default:
                                break;
                        }
                    },
                });
            }
        };
        this.dispose = function () {
            if (_this.sparklineIntervalTimer !== null) {
                clearInterval(_this.sparklineIntervalTimer);
                _this.sparklineIntervalTimer = null;
            }
            if (_this.sparkline !== null) {
                _this.sparkline.dispose();
                _this.sparkline = null;
                document.querySelector('[data-core-cpu-progress]').innerHTML = '';
                _this.cpuUsages = [];
            }
            if (_this.cpuUsageProgressBar !== null) {
                _this.cpuUsageProgressBar.dispose();
                _this.cpuUsageProgressBar = null;
            }
            if (_this.cpuFreeProgressBar !== null) {
                _this.cpuFreeProgressBar.dispose();
                _this.cpuFreeProgressBar = null;
            }
        };
        this.buildCpuTabContent = function () {
            var cpuUsageProgressBarContainerElement = document.querySelector('[data-core-cpu-usage-progress-bar]');
            if (cpuUsageProgressBarContainerElement) {
                _this.cpuUsageProgressBar = new progress_bar_1.default(cpuUsageProgressBarContainerElement, {
                    width: '100%',
                    statusFormat: function (ratio, value) { return "CPU usage: ".concat((ratio * 100).toFixedNumber(2, 10), " %"); },
                });
            }
            var cpuFreeProgressBarContainerElement = document.querySelector('[data-core-cpu-free-progress-bar]');
            if (cpuFreeProgressBarContainerElement) {
                _this.cpuFreeProgressBar = new progress_bar_1.default(cpuFreeProgressBarContainerElement, {
                    width: '100%',
                    statusFormat: function (ratio, value) { return "CPU free: ".concat((ratio * 100).toFixedNumber(2, 10), " %"); },
                });
            }
            var cpuProgressContainerElement = document.querySelector('[data-core-cpu-progress]');
            if (cpuProgressContainerElement) {
                _this.sparkline = new spark_line_chart_1.SparklineChart(cpuProgressContainerElement, {
                    dataSource: _this.cpuUsages,
                    commonSeriesSettings: {
                        color: _this.currentTheme && _this.currentTheme.indexOf('orange') > 0 ? 'orangered' : 'teal',
                    },
                });
            }
            document.querySelector('[data-core-cpu-progress]').style.display = 'none';
            var awaiter = setTimeout(function () {
                document.querySelector('[data-core-cpu-progress]').style.display = 'block';
                if (_this.sparkline) {
                    _this.sparkline.render({
                        force: true,
                        animate: true,
                        asyncSeriesRendering: true,
                    });
                }
                clearTimeout(awaiter);
            }, 500);
            _this.sparklineIntervalTimer = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                var cpuUsage, _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, cpu.usage()];
                        case 1:
                            cpuUsage = _d.sent();
                            this.cpuUsages.push({
                                time: new Date(),
                                value: cpuUsage,
                            });
                            if (this.cpuUsages.length >= 100) {
                                this.cpuUsages.shift();
                            }
                            if (this.sparkline !== null) {
                                if (this.cpuUsages.length >= 5) {
                                    this.sparkline.option('dataSource', this.cpuUsages);
                                }
                            }
                            if (!(this.cpuFreeProgressBar && this.cpuUsageProgressBar)) return [3 /*break*/, 3];
                            this.cpuUsageProgressBar.option('value', cpuUsage);
                            _b = (_a = this.cpuFreeProgressBar).option;
                            _c = ['value'];
                            return [4 /*yield*/, cpu.free()];
                        case 2:
                            _b.apply(_a, _c.concat([_d.sent()]));
                            _d.label = 3;
                        case 3:
                            if (cpuUsage > this.settings.cpuOverloading) {
                                if (this.lastNotificationDateTime === null || (this.lastNotificationDateTime !== null && Date.compare(this.lastNotificationDateTime, new Date()) === -1)) {
                                    new Notification('SysTop Notification', {
                                        body: "CPU overloaded ".concat(cpuUsage, " percent"),
                                        icon: "./assets/icons/icon.png",
                                    });
                                    this.lastNotificationDateTime = new Date().addSeconds(this.settings.alertInterval);
                                }
                            }
                            return [2 /*return*/];
                    }
                });
            }); }, 1000);
        };
        this.buildSystemInfoTabContent = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        document.querySelector('[data-core-model]').innerHTML = "CPU model: ".concat(cpu.model());
                        document.querySelector('[data-core-host]').innerHTML = "Hostname: ".concat(os.hostname());
                        document.querySelector('[data-core-os]').innerHTML = "OS info: ".concat(os.type(), " (").concat(os.arch(), ")");
                        _a = document.querySelector('[data-core-mem]');
                        _b = "Total memory: ".concat;
                        return [4 /*yield*/, mem.info()];
                    case 1:
                        _a.innerHTML = _b.apply("Total memory: ", [(_c.sent()).totalMemMb, " MBytes"]);
                        document.querySelector('[data-core-uptime]').innerHTML = "System uptime: ".concat(new Date().clearTime().addSeconds(os.uptime()).toString('H:mm:ss'));
                        return [2 /*return*/];
                }
            });
        }); };
        this.buildSettingsTab = function () {
            var settingsFormContainerElement = document.querySelector('[data-core-settings]');
            if (settingsFormContainerElement) {
                new form_1.default(settingsFormContainerElement, {
                    formData: _this.settings,
                    items: [
                        {
                            name: 'cpuOverloading',
                            dataField: 'cpuOverloading',
                            editorType: 'dxNumberBox',
                            label: {
                                text: 'CPU Loading',
                                showColon: true,
                            },
                            editorOptions: {
                                showSpinButtons: true,
                                showClearButton: true,
                                min: 0,
                                max: 100,
                            },
                        },
                        {
                            name: 'alertInterval',
                            dataField: 'alertInterval',
                            editorType: 'dxNumberBox',
                            label: {
                                text: 'Alert interval',
                                showColon: true,
                            },
                            editorOptions: {
                                showSpinButtons: true,
                                showClearButton: true,
                                min: 10,
                                max: 120,
                            },
                        },
                        {
                            name: 'saveButton',
                            buttonOptions: {
                                type: 'danger',
                                text: 'Save',
                                width: '100%',
                                onClick: function () {
                                    electron_1.ipcRenderer.invoke('settings:save', _this.settings);
                                },
                            },
                        },
                    ],
                });
            }
        };
        this.execute = function () { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        electron_1.ipcRenderer.on('settings:response', function (e, data) {
                            _this.settings = data;
                        });
                        return [4 /*yield*/, electron_1.ipcRenderer.invoke('settings:request')];
                    case 1:
                        _a.sent();
                        this.buildMenu();
                        this.buildTabPanel();
                        this.buildCpuTabContent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.currentTheme = !localStorage.getItem('currentTheme') ? 'material.teal.light' : localStorage.getItem('currentTheme');
        if (this.currentTheme) {
            // themes.current(this.currentTheme);
        }
    }
    return MainRenderedWindow;
}());
exports.MainRenderedWindow = MainRenderedWindow;
