const { app } = require('electron').remote;
const osu = require('node-os-utils');
const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;

Number.prototype.toFixedNumber = function (digits, base)
{
    var pow = Math.pow( base || 10, digits );
    return Math.round( this * pow) / pow;
};

class MainWindow {
    
    cpuUsages = [];

    currentTheme = null;
    
    cpuUsageProgressBar = null;
    cpuFreeProgressBar = null;
    
    #sparkline;

    constructor ()
    {
        this.currentTheme = !localStorage.getItem('currentTheme') 
            ? "material.teal.light" 
            : localStorage.getItem('currentTheme');

        DevExpress.ui.themes.current(this.currentTheme); 
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
            }
        });
    };
    #buildCpuProgress = () =>
    {
       this.cpuUsageProgressBar = new DevExpress.ui.dxProgressBar (document.querySelector('[data-core-cpu-usage-progress-bar]'),
        {
            width: '100%',
            statusFormat: (ratio, value) => `CPU usage: ${ratio * 100} %`                        
        });

        this.cpuFreeProgressBar = new DevExpress.ui.dxProgressBar (document.querySelector('[data-core-cpu-free-progress-bar]'),
        {
            width: '100%',
            statusFormat: (ratio, value) => `CPU free: ${ (ratio * 100).toFixedNumber(2)} %`                        
        });
    }
    execute = async () =>
    {        
        this.#buildMenu();
        this.#buildTabPanel();

        this.#buildCpuProgress();
        
        
        this.#sparkline = new DevExpress.viz.dxSparkline(document.querySelector('[data-core-cpu-progress]'), {
            dataSource: this.cpuUsages,            
            width: 500,
            argumentField: "time",
            valueField: "value",
            lineColor: "teal",
            firstLastColor: "teal",
            pointSize: 2,
            pointSymbol: "circle",
            pointColor: "teal",
            type: "spline"
        });
        
        
        document.querySelector('[data-core-model]').innerHTML = `CPU model: ${cpu.model()}`;
        document.querySelector('[data-core-host]').innerHTML = `Hostname: ${os.hostname()}`;
        document.querySelector('[data-core-os]').innerHTML = `OS info: ${os.type()} (${os.arch()})`;
        document.querySelector('[data-core-mem]').innerHTML = `Total memory: ${(await mem.info()).totalMemMb} MBytes`;

        setInterval(async ()=>
        {           
            const cpuUsage = await cpu.usage();

            this.cpuUsages.push({time: (new Date()), value: cpuUsage});
            this.#sparkline.option('dataSource', this.cpuUsages);

            this.cpuUsageProgressBar.option('value', cpuUsage);
            this.cpuFreeProgressBar.option('value', await cpu.free());             
        }, 1000);            
    }
};

module.exports = MainWindow;