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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainBrowserWindow = void 0;
var electron_1 = require("electron");
var path = __importStar(require("path"));
var MainBrowserWindow = /** @class */ (function () {
    function MainBrowserWindow() {
        this.win = new electron_1.BrowserWindow({
            icon: path.join(__dirname, '../assets/icons/icon.png'),
            width: 500,
            height: 500,
            resizable: true,
            show: false,
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                nodeIntegrationInWorker: true,
                contextIsolation: false
            },
        });
        this.win.loadURL(path.join('file://', __dirname, '../index.html'));
        this.win.webContents.openDevTools();
    }
    return MainBrowserWindow;
}());
exports.MainBrowserWindow = MainBrowserWindow;
