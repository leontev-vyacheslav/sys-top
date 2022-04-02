import { app, Tray, Menu } from 'electron';
import * as path from 'path';
import { MainBrowserWindow } from './main-browser-window';

export class AppTray extends Tray {

  mainWindow: MainBrowserWindow;

  constructor(mainWindow: MainBrowserWindow) {
    const iconPath = path.join(__dirname, '../assets/icons/tray_icon.png');
    super(iconPath);
    this.mainWindow = mainWindow;
    this.on('click', this.onClick);
    this.on('right-click', this.onRightClick);
  }

  onClick = () => {
    if (this.mainWindow.win.isVisible() === true) {
      this.mainWindow.win.hide();
    } else {
      this.mainWindow.win.show();
    }
  };

  onRightClick = () => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Quit',
        click: () => {
          (app as any).isQuitting = true;
          app.quit();
        },
      },
    ]);
    this.popUpContextMenu(contextMenu);
  };
}
