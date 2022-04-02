import { app, ipcMain } from 'electron';
import { MainBrowserWindow } from './app/main-browser-window';
import * as path from 'path';
import * as fs from 'fs/promises'


import { AppTray } from './app/app-tray';

process.env.NODE_ENV = 'production';

let mainWindow: MainBrowserWindow,
  tray: AppTray;

ipcMain.handle('settings:request', async () => {
  let settings = null;
  try {
    const data = await fs.readFile(path.join(app.getPath('userData'), 'settings.json'));
    settings = data.toJSON();
  } catch (error) {
    settings = {
      cpuOverloading: 20,
      alertInterval: 60,
    };
  }

  mainWindow.win.webContents.send('settings:response', settings);
});

ipcMain.handle('settings:save', async (_, settings) => {
  await fs.writeFile(path.join(app.getPath('userData'), 'settings.json'), JSON.stringify(settings));
});

ipcMain.handle('app:quit', async () => {
  (app as any).isQuitting = true;
  app.quit();
});

ipcMain.handle('mainWindow:hide', async () => {
  mainWindow.win.hide();
});

app.whenReady().then(() => {

  mainWindow = new MainBrowserWindow();

  if (mainWindow) {

    mainWindow.win.once('ready-to-show', () => {
      mainWindow.win.show();
    });

    mainWindow.win.on('close', (e) => {
      if (!(app as any).isQuitting) {
        e.preventDefault();
        mainWindow.win.hide();
      }
      return false;
    });

    tray = new AppTray(mainWindow);
  }
});
