const { app, getCurrentWindow } = require('electron').remote;

const osu = require('node-os-utils');
const { ipcRenderer } = require('electron');

const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;
require('datejs');

const SparklineChart = require('./SparklineChart');

Number.prototype.toFixedNumber = function (digits, base) {
    var pow = Math.pow(base || 10, digits);
    return Math.round(this * pow) / pow;
};

class MainRenderedWindow {

    #settings = {
        cpuOverloading: 20,
        alertInterval: 60
    };

    #lastNotificationDateTime = null;
    cpuUsages = [];

    currentTheme = null;

    #cpuUsageProgressBar = null;
    #cpuFreeProgressBar = null;

    #sparkline = null;
    #sparklineIntervalTimer = null;

    constructor() {
        this.currentTheme = !localStorage.getItem('currentTheme') ?
            "material.teal.light" :
            localStorage.getItem('currentTheme');

        DevExpress.ui.themes.current(this.currentTheme);
    }

    #buildMenu = () => {

        const themes =  [
            {text: 'Dark Teal theme', theme: 'material.teal.dark'},
            {text: 'Light Teal theme', theme: 'material.teal.light'},
            {text: 'Dark Orange theme', theme: 'material.orange.dark'},
            {text: 'Light Orange theme', theme: 'material.orange.light'}
        ];

        const themeMenuItems = themes.map( t =>
            {
                return {
                    text: t.text,
                    selectable: true,
                    onClick: (c) => {
        
                        this.currentTheme = t.theme;
                        DevExpress.ui.themes.current(this.currentTheme);
                        localStorage.setItem('currentTheme', this.currentTheme);
                        if (this.#sparkline !== null) {                            
                            this.#sparkline.option ('commonSeriesSettings',
                            {                
                                color:  this.currentTheme.indexOf('orange') > 0 ? 'orangered': 'teal',
                            });
                        }
                    }
                }        
            });
        
        new DevExpress.ui.dxMenu(document.querySelector('[data-core-main-menu]'), {
            items: [{

                icon: "menu",
                items: [{
                        text: "About...",
                        icon: "preferences",
                        beginGroup: true,
                        onClick: () => {}
                    },
                    {
                        text: 'Themes',
                        icon: 'image',
                        items: themeMenuItems
                    },
                    {
                        text: "Quit",
                        icon: "export",
                        onClick: () => {
                            app.quit();
                        }
                    }
                ]
            }]
        });
        new DevExpress.ui.dxMenu(document.querySelector('[data-core-close-menu]'), {
            items: [{
                icon: 'close',
                onClick : () =>
                {                    
                    getCurrentWindow().hide();
                }
            }]
        });
    };

    #buildTabPanel = () => {
        new DevExpress.ui.dxTabPanel(document.querySelector('.core-tab-panel'), {
            height: 60,
            items: [{
                    title: 'CPU',
                    icon: 'smalliconslayout',
                    selector: 'cpu'
                },
                {
                    title: 'SYSTEM INFO',
                    icon: 'info',
                    selector: 'system-info'
                },
                {
                    title: 'SETTINGS',
                    icon: 'preferences',
                    selector: 'settings'
                }
            ],
            onTitleClick: (e) => {
                document.querySelectorAll('[data-core-tabs] > *').forEach(e => {
                    e.style.display = 'none';
                });
                document.querySelector(`[data-core-tab-${e.itemData.selector}]`).style.display = 'block';
            },
            onSelectionChanged: (e) => {
                const selectedIndex = e.component.option('selectedIndex');
                this.#dispose();

                switch (selectedIndex) {
                    case 0: {
                        this.#buildCpuTabContent();
                        break;
                    }
                    case 1: {
                        this.#buildSystemInfoTabContent();
                        break;
                    }
                    case 2: {
                        this.#buildSettingsTab();
                        break;
                    }

                    default:
                        break;
                }
            }
        });
    };

    #dispose = () => {
        if (this.#sparklineIntervalTimer !== null) {
            clearInterval(this.#sparklineIntervalTimer);
            this.#sparklineIntervalTimer = null;
        }

        if (this.#sparkline !== null) {
            this.#sparkline.dispose();
            this.#sparkline = null;
            document.querySelector('[data-core-cpu-progress]').innerHTML = '';
            this.cpuUsages = [];
        }

        if (this.#cpuUsageProgressBar !== null) {
            this.#cpuUsageProgressBar.dispose();
            this.#cpuUsageProgressBar = null;
        }
        if (this.#cpuFreeProgressBar !== null) {
            this.#cpuFreeProgressBar.dispose();
            this.#cpuFreeProgressBar = null;
        }
    };

    #buildCpuTabContent = () => {

        this.#cpuUsageProgressBar = new DevExpress.ui.dxProgressBar(document.querySelector('[data-core-cpu-usage-progress-bar]'), {
            width: '100%',
            statusFormat: (ratio, value) => `CPU usage: ${(ratio * 100).toFixedNumber(2)} %`
        });

        this.#cpuFreeProgressBar = new DevExpress.ui.dxProgressBar(document.querySelector('[data-core-cpu-free-progress-bar]'), {
            width: '100%',
            statusFormat: (ratio, value) => `CPU free: ${ (ratio * 100).toFixedNumber(2)} %`
        });

        this.#sparkline = new SparklineChart(document.querySelector('[data-core-cpu-progress]'), 
        {
            dataSource: this.cpuUsages,
            commonSeriesSettings: {
                color:  this.currentTheme.indexOf('orange') > 0 ? 'orangered': 'teal',
            }
        });

        document.querySelector('[data-core-cpu-progress]').style.display = 'none';

        let awaiter = setTimeout(() => {

            document.querySelector('[data-core-cpu-progress]').style.display = 'block';
            this.#sparkline.render({
                force: true,
                animate: true,
                asyncSeriesRendering: true
            });
            clearTimeout(awaiter);

        }, 500);

        this.#sparklineIntervalTimer = setInterval(async () => {
            const cpuUsage = await cpu.usage();

            this.cpuUsages.push({
                time: (new Date()),
                value: cpuUsage
            });

            if (this.cpuUsages.length >= 100) {
                this.cpuUsages.shift();
            }

            if (this.#sparkline !== null) {
                if (this.cpuUsages.length >= 5) {
                    this.#sparkline.option('dataSource', this.cpuUsages);
                }
            }

            if(this.#cpuFreeProgressBar && this.#cpuUsageProgressBar)
            {
                this.#cpuUsageProgressBar.option('value', cpuUsage);
                this.#cpuFreeProgressBar.option('value', await cpu.free());
            }

            if (cpuUsage > this.#settings.cpuOverloading) {
                if (this.#lastNotificationDateTime === null ||
                    (this.#lastNotificationDateTime !== null && Date.compare(this.#lastNotificationDateTime, new Date()) === -1)
                ) {
                    new Notification(
                        'SysTop Notification', {
                            body: `CPU overloaded ${cpuUsage} percent`,
                            icon: `./assets/icons/icon.png`
                        });
                    this.#lastNotificationDateTime = (new Date()).addSeconds(this.#settings.alertInterval);
                }
            }
        }, 1000);
    };

    #buildSystemInfoTabContent = async () => {
        document.querySelector('[data-core-model]').innerHTML = `CPU model: ${cpu.model()}`;
        document.querySelector('[data-core-host]').innerHTML = `Hostname: ${os.hostname()}`;
        document.querySelector('[data-core-os]').innerHTML = `OS info: ${os.type()} (${os.arch()})`;
        document.querySelector('[data-core-mem]').innerHTML = `Total memory: ${(await mem.info()).totalMemMb} MBytes`;

        document.querySelector('[data-core-uptime]').innerHTML =
            `System uptime: ${ (new Date()).clearTime().addSeconds(os.uptime()).toString('H:mm:ss') }`;

    };

    #buildSettingsTab = () => {
        new DevExpress.ui.dxForm(document.querySelector('[data-core-settings]'), {
            formData: this.#settings,
            items: [{
                    name: "cpuOverloading",
                    dataField: "cpuOverloading",
                    editorType: "dxNumberBox",
                    label: {
                        text: "CPU Loading",
                        showColonAfterLabel: true,
                    },

                    editorOptions: {
                        showSpinButtons: true,
                        showClearButton: true,
                        min: 0,
                        max: 100
                    }
                },
                {
                    name: "alertInterval",
                    dataField: "alertInterval",
                    editorType: "dxNumberBox",
                    label: {
                        text: "Alert interval",
                        showColonAfterLabel: true,
                    },
                    editorOptions: {
                        showSpinButtons: true,
                        showClearButton: true,
                        min: 10,
                        max: 120
                    }
                },
                {
                    name: 'saveButton',
                    editorType: 'dxButton',
                    editorOptions: {
                        type: 'danger', 
                        text: 'Save',
                        width: '100%',
                        onClick: () => {
                            ipcRenderer.send('settings:save', this.#settings);
                        }
                    }
                }
            ]
        });
    };

    execute = async () => {
        ipcRenderer.on('settings:response', (e, data) => {
            this.#settings = data;
        });

        ipcRenderer.send('settings:request');

        this.#buildMenu();
        this.#buildTabPanel();

        this.#buildCpuTabContent();
    }
};

module.exports = MainRenderedWindow;