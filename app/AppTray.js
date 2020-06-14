const {
    app,
    Tray,
    Menu
} = require('electron');
const path = require('path');

class AppTray extends Tray {
    
    constructor(mainWindow) {
       
        const iconPath = path.join(__dirname, '../assets/icons/tray_icon.png');
        super(iconPath);
        this.mainWindow = mainWindow;
        this.on('click', this.onClick);
        this.on('right-click', this.onRightClick);
    }


    onClick = () => {
        if (this.mainWindow.isVisible() === true) {
            this.mainWindow.hide();
        } else {
            this.mainWindow.show();
        }
    };

    onRightClick = () => {
        const contextMenu = Menu.buildFromTemplate([{
            label: 'Quit',
            click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }]);
        this.popUpContextMenu(contextMenu);
    };

};

module.exports = AppTray;