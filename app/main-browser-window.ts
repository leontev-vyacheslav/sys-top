import { BrowserWindow } from 'electron';
import * as path from 'path';

export class MainBrowserWindow {
  win: BrowserWindow;
  constructor() {

    this.win = new BrowserWindow({
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
 }

