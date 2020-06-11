const { app } = require('electron').remote;
const osu = require('node-os-utils');
const { ipcRenderer } = require('electron');
const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;
require('datejs');


Number.prototype.toFixedNumber = function (digits, base)
{
    var pow = Math.pow( base || 10, digits );
    return Math.round( this * pow) / pow;
};



class MainWindow {
    
    #cpuOverloading = 10;

    #lastNotificationDateTime = null;
    cpuUsages = [];

    currentTheme = null;
    
    #cpuUsageProgressBar = null;
    #cpuFreeProgressBar = null;
    
    #sparkline = null;
    #sparklineIntervalTimer = null;   

    constructor ()
    {
        this.currentTheme = !localStorage.getItem('currentTheme') 
            ? "material.teal.light" 
            : localStorage.getItem('currentTheme');

        DevExpress.ui.themes.current(this.currentTheme); 

        ipcRenderer.on('settings:response', (e, data) =>
        {
            console.log(data);
        });

        ipcRenderer.send('settings:request');
    }
    
    #buildMenu = () =>
    {
        new  DevExpress.ui.dxMenu (document.querySelector('[data-core-main-menu]'), {
            items: [
                {
                    
                    icon: "menu", 
                    items: [                    
                        {
                            text: "About...",
                            icon: "preferences",
                            beginGroup: true,
                            onClick: () => {}
                        },
                        {
                            text: 'Themes',
                            icon: 'image',
                            items: [
                                {
                                    text: 'Dark Teal theme',
                                    selectable: true,
                                    onClick: (c) =>
                                    {
                                                                                
                                        this.currentTheme = 'material.teal.dark';
                                        DevExpress.ui.themes.current(this.currentTheme ); 
                                        localStorage.setItem('currentTheme', this.currentTheme );
                                    }
                                },
                                {
                                    text: 'Light Teal theme',
                                    selectable: true,
                                    onClick: () =>
                                    {
                                        this.currentTheme = 'material.teal.light';
                                        DevExpress.ui.themes.current(this.currentTheme ); 
                                        localStorage.setItem('currentTheme', this.currentTheme );
                                    }
                                }
                            ]
                        },
                        {
                            text: "Quit",
                            icon: "export", 
                            onClick: () => { app.quit(); } 
                        }               
                    ]
                }                
            ] 
        });
        new DevExpress.ui.dxMenu (document.querySelector('[data-core-close-menu]'), {
            items: [ { icon: 'close'} ]
        });
    };

    #buildTabPanel = () =>
    {
        new DevExpress.ui.dxTabPanel(document.querySelector('.core-tab-panel'), {
            height: 60,
            items: [
                { title: 'CPU', icon: 'smalliconslayout',  selector: 'cpu' },
                { title: 'SYSTEM INFO', icon: 'info', selector: 'system-info' },
                { title: 'SETTINGS', icon: 'preferences', selector: 'settings'}
            ],
            onTitleClick: (e) =>
            {
                document.querySelectorAll('[data-core-tabs] > *').forEach(e =>
                    {
                        e.style.display = 'none';
                    });
                document.querySelector(`[data-core-tab-${e.itemData.selector}]`).style.display = 'block';                
            },
            onSelectionChanged: (e) =>
            {
                const selectedIndex = e.component.option('selectedIndex');
                this.#dispose();
                
                switch (selectedIndex) {
                    case 0:
                        this.#buildCpuTabContent();    
                        break;
                    case 1:
                        this.#buildSystemInfoTabContent();
                        break;
                    default:
                        break;
                }  
                
            }
        });
    };

    #dispose = () =>
    {
        if(this.#sparklineIntervalTimer !== null)
        {
            clearInterval(this.#sparklineIntervalTimer);
            this.#sparklineIntervalTimer = null;       
        }
        if(this.#sparkline !== null)
        {
            this.#sparkline.dispose();
            this.#sparkline = null;   
            document.querySelector('[data-core-cpu-progress]').innerHTML = '';         
        }

        if (this.#cpuUsageProgressBar !== null)
        {
            this.#cpuUsageProgressBar.dispose();                
            this.#cpuUsageProgressBar = null;
        }
        if (this.#cpuFreeProgressBar !== null)
        {
            this.#cpuFreeProgressBar.dispose();                
            this.#cpuFreeProgressBar = null;
        }
    };

    #buildCpuTabContent = () =>
    {        
        
        this.#cpuUsageProgressBar = new DevExpress.ui.dxProgressBar (document.querySelector('[data-core-cpu-usage-progress-bar]'),
        {
            width: '100%',
            statusFormat: (ratio, value) => `CPU usage: ${(ratio * 100).toFixedNumber(2)} %`                        
        });

        this.#cpuFreeProgressBar = new DevExpress.ui.dxProgressBar (document.querySelector('[data-core-cpu-free-progress-bar]'),
        {
            width: '100%',
            statusFormat: (ratio, value) => `CPU free: ${ (ratio * 100).toFixedNumber(2)} %`                        
        });
                
        this.#sparkline = new DevExpress.viz.dxChart(document.querySelector('[data-core-cpu-progress]'), {
            dataSource: this.cpuUsages,            
            width: '100%',
            height: 125,            
            showGrid: false,
            animation:
            {
                enabled: false
            },
            tooltip: {
                enabled: true
            },
            commonAxisSettings:{
                visible: false,
                grid: { visible: false },
                minorGrid: { visible: false },
                label: { visible: false },                
                tick: { visible: false },
                minorTick: { visible: false }
            },
            argumentAxis: {
                argumentType: 'datetime',                
            },
            series: [
                {
                    argumentField: "time",
                    valueField: "value",
                    type: "spline",
                    showInLegend: false,                    
                    color: 'teal',                    
                    point:{
                        visible: false
                    },
                    valueAxis:
                    {
                        visible: false                
                    },
                    argumentAxis:
                    {
                        visible: false
                    }
                }
            ]           
        });
        
        document.querySelector('[data-core-cpu-progress]').style.display = 'none';

        setTimeout(() => {
            
            document.querySelector('[data-core-cpu-progress]').style.display = 'block';
            this.#sparkline.render({
                force: true, 
                animate: true, 
                            asyncSeriesRendering: true 
                        });                    
            }, 500);
                       
        this.#sparklineIntervalTimer = setInterval(async ()=>
        {           
            const cpuUsage = await cpu.usage();

            this.cpuUsages.push({time: (new Date()), value: cpuUsage});
            
            if(this.cpuUsages.length >= 100)
            {
                this.cpuUsages.shift();
            }
            
            if(this.cpuUsages.length >= 5 )
            {
                this.#sparkline.option('dataSource', this.cpuUsages);
            }
            
            this.#cpuUsageProgressBar.option('value', cpuUsage);
            this.#cpuFreeProgressBar.option('value', await cpu.free());    
            
            if(cpuUsage > this.#cpuOverloading)
            {
                if(this.#lastNotificationDateTime === null || 
                    ( this.#lastNotificationDateTime !== null && Date.compare( this.#lastNotificationDateTime, new Date()) === -1)
                )
                {
                    new Notification(
                        'SysTop Notification', {
                        body: `CPU overloaded ${cpuUsage} percent`,
                        icon:  `../assets/icons/icon.png`                       
                    });         
                    this.#lastNotificationDateTime = (new Date()).addSeconds(60); 
                                       
                }
            }
        }, 1000);  
    };

    #buildSystemInfoTabContent = async () =>
    {
        document.querySelector('[data-core-model]').innerHTML = `CPU model: ${cpu.model()}`;
        document.querySelector('[data-core-host]').innerHTML = `Hostname: ${os.hostname()}`;
        document.querySelector('[data-core-os]').innerHTML = `OS info: ${os.type()} (${os.arch()})`;
        document.querySelector('[data-core-mem]').innerHTML = `Total memory: ${(await mem.info()).totalMemMb} MBytes`;

        document.querySelector('[data-core-uptime]').innerHTML = 
            `System uptime: ${ (new Date()).clearTime().addSeconds(os.uptime()).toString('H:mm:ss') }`;
    
    };

    execute = async () =>
    {        
        this.#buildMenu();
        this.#buildTabPanel();

        this.#buildCpuTabContent();              
    }
};

module.exports = MainWindow;