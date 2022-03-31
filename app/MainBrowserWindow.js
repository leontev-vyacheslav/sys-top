const { app, BrowserWindow } = require('electron');
const path = require('path');

class MainBrowserWindow extends BrowserWindow {
  constructor() {
    super({
      icon: path.join(__dirname, '../assets/icons/icon.png'),
      width: 500,
      height: 500,
      resizable: true,
      show: false,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
    });

    this.loadURL(path.join('file://', __dirname, '../index.html'));
    this.webContents.openDevTools();
  }
}

module.exports = MainBrowserWindow;
