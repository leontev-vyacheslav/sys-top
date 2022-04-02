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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppTray = void 0;
var electron_1 = require("electron");
var path = __importStar(require("path"));
var AppTray = /** @class */ (function (_super) {
    __extends(AppTray, _super);
    function AppTray(mainWindow) {
        var _this = this;
        var iconPath = path.join(__dirname, '../assets/icons/tray_icon.png');
        _this = _super.call(this, iconPath) || this;
        _this.onClick = function () {
            if (_this.mainWindow.win.isVisible() === true) {
                _this.mainWindow.win.hide();
            }
            else {
                _this.mainWindow.win.show();
            }
        };
        _this.onRightClick = function () {
            var contextMenu = electron_1.Menu.buildFromTemplate([
                {
                    label: 'Quit',
                    click: function () {
                        electron_1.app.isQuitting = true;
                        electron_1.app.quit();
                    },
                },
            ]);
            _this.popUpContextMenu(contextMenu);
        };
        _this.mainWindow = mainWindow;
        _this.on('click', _this.onClick);
        _this.on('right-click', _this.onRightClick);
        return _this;
    }
    return AppTray;
}(electron_1.Tray));
exports.AppTray = AppTray;
