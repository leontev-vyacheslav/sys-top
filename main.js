const {
    app,
    ipcMain
} = require('electron');

const
    fs = require('fs'),
    path = require('path'),
    log = require('electron-log');

const MainBrowserWindow = require('./app/MainBrowserWindow.js');
const AppTray = require('./app/AppTray.js');

process.env.NODE_ENV = 'production';

let mainWindow = null,
    tray = null;

ipcMain.on('settings:request', () => {
    let settings = null;
    try {
        settings = JSON.parse(
            fs.readFileSync(path.join(app.getPath('userData'), 'settings.json'))
        );
    } catch (error) {
        settings = {
            cpuOverloading: 20,
            alertInterval: 60
        };
    }

    mainWindow.webContents.send('settings:response', settings);
});

ipcMain.on('settings:save', (_, settings) => {
    fs.writeFileSync(path.join(app.getPath('userData'), 'settings.json'), JSON.stringify(settings));
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
    })

    tray = new AppTray(mainWindow);
});