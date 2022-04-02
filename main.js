const { app, ipcMain, getCurrentWindow } = require('electron');

const fs = require('fs').promises,
  path = require('path'),
  log = require('electron-log');

const MainBrowserWindow = require('./app/MainBrowserWindow.js');
const AppTray = require('./app/AppTray.js');

process.env.NODE_ENV = 'production';

let mainWindow = null,
  tray = null;

ipcMain.handle('settings:request', async () => {
  let settings = null;
  try {
    const data = await fs.readFile(path.join(app.getPath('userData'), 'settings.json'));
    settings = JSON.parse(data);
    log.log(settings);
  } catch (error) {
    settings = {
      cpuOverloading: 20,
      alertInterval: 60,
    };
  }

  mainWindow.webContents.send('settings:response', settings);
});

ipcMain.handle('settings:save', async (_, settings) => {
  await fs.writeFile(path.join(app.getPath('userData'), 'settings.json'), JSON.stringify(settings));
});

ipcMain.handle('app:quit', async () => {
  app.isQuitting = true;
  app.quit();
});

ipcMain.handle('mainWindow:hide', async () => {
  mainWindow.hide();
});

app.whenReady().then(() => {
  mainWindow = new MainBrowserWindow();

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  tray = new AppTray(mainWindow);
});
