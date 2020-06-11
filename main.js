const { app, BrowserWindow, ipcMain  } = require('electron');
const log = require('electron-log');

let mainWindow = null;

ipcMain.on('settings:request', () =>
{
    mainWindow.webContents.send('settings:response', {cpuOverloading: 20});
});

const createMainWindow = () =>
{
    mainWindow = new BrowserWindow({
        icon:  `${__dirname}/assets/icons/icon.png`,
        width: 500,
        height: 500,
        resizable: true,
        show: false,
        frame: false,
        webPreferences:{
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    mainWindow.loadURL(`file://${__dirname}/app/index.html`);   
};

app.whenReady().then( () =>
{
    createMainWindow();

    
    mainWindow.once('ready-to-show', () =>
    {      
        log.log('ready-to-show');             
        mainWindow.show();              
    });    
});