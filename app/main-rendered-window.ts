import * as osu from 'node-os-utils';
import 'datejs';
import { ipcRenderer } from 'electron';
import { SparklineChart } from './spark-line-chart';
import Form, { ButtonItem } from 'devextreme/ui/form';
import ProgressBar from 'devextreme/ui/progress_bar';
import Menu, { Item } from 'devextreme/ui/menu';
import TabPanel from 'devextreme/ui/tab_panel';
import themes from "devextreme/ui/themes";

declare global {
  interface Number {
    toFixedNumber: (digits: number, base: number) => number;
  }
}

Number.prototype.toFixedNumber = function (digits: number, base: number) {
  var pow = Math.pow(base || 10, digits);
  return Math.round(digits * pow) / pow;
};

const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;

interface CommandMenuItem extends Item {
  commandName?: string,
  data: any
}

export class MainRenderedWindow {
  settings = {
    cpuOverloading: 20,
    alertInterval: 60,
  };

  lastNotificationDateTime: Date | null = null;

  cpuUsages: { time: Date, value: number }[] = [];

  currentTheme: string | null = null;

  cpuUsageProgressBar: ProgressBar | null = null;

  cpuFreeProgressBar: ProgressBar | null = null;

  sparkline: SparklineChart | null = null;

  sparklineIntervalTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.currentTheme = !localStorage.getItem('currentTheme') ? 'material.teal.light' : localStorage.getItem('currentTheme');
    if (this.currentTheme) {
      // themes.current(this.currentTheme);
    }
  }

  buildMenu = () => {
    const themeList = [
      { text: 'Dark Teal theme', theme: 'material.teal.dark' },
      { text: 'Light Teal theme', theme: 'material.teal.light' },
      { text: 'Dark Orange theme', theme: 'material.orange.dark' },
      { text: 'Light Orange theme', theme: 'material.orange.light' },
    ];

    const themeMenuItems: CommandMenuItem[] = themeList.map((t) => {
      return {
        text: t.text,
        selectable: true,
        commandName: 'theme',
        data: t.theme
      };
    });

    const mainMenuContainerElement = document.querySelector('[data-core-main-menu]');

    if (mainMenuContainerElement) {
      new Menu(mainMenuContainerElement, {
        onItemClick: (e) => {
          const commandName = (e.itemData as CommandMenuItem).commandName
          if (commandName === 'quit') {
            ipcRenderer.invoke('app:quit');
          } else if (commandName === 'theme') {
            this.currentTheme = (e.itemData as CommandMenuItem).data;
            console.log(this.currentTheme);

            if (this.currentTheme) {
              // themes.current(this.currentTheme);
              localStorage.setItem('currentTheme', this.currentTheme);
              if (this.sparkline !== null) {
                this.sparkline.option('commonSeriesSettings', {
                  color: this.currentTheme.indexOf('orange') > 0 ? 'orangered' : 'teal',
                });
              }
            }
          }
        },
        items: [
          {
            icon: 'menu',
            items: [
              {
                text: 'About...',
                icon: 'preferences',
                beginGroup: true,
                commandName: 'about'
              },
              {
                text: 'Themes',
                icon: 'image',
                items: themeMenuItems,
              },
              {
                text: 'Quit',
                icon: 'export',
                commandName: 'quit'
              },
            ] as CommandMenuItem[],
          },
        ],
      });
    }

    const closeMenuContainerElement = document.querySelector('[data-core-close-menu]');

    if (closeMenuContainerElement) {
      new Menu(closeMenuContainerElement, {
        onItemClick: (e) => {
          if ((e.itemData as CommandMenuItem).commandName === 'hide')
            ipcRenderer.invoke('mainWindow:hide');
        },
        items: [
          {
            icon: 'close',
            commandName: 'hide'
          },
        ] as CommandMenuItem[],
      });
    }
  };

  buildTabPanel = () => {
    const tabPanelContainerElement = document.querySelector('.core-tab-panel');
    if (tabPanelContainerElement) {
      new TabPanel(tabPanelContainerElement, {
        height: 60,
        items: [
          {
            title: 'CPU',
            icon: 'smalliconslayout',
            selector: 'cpu',
          },
          {
            title: 'SYSTEM INFO',
            icon: 'info',
            selector: 'system-info',
          },
          {
            title: 'SETTINGS',
            icon: 'preferences',
            selector: 'settings',
          },
        ],
        onTitleClick: (e) => {
          document.querySelectorAll('[data-core-tabs] > *').forEach((item) => {
            (item as HTMLElement).style.display = 'none';
          });
          (document.querySelector(`[data-core-tab-${(e as any).itemData.selector}]`) as HTMLElement).style.display = 'block';
        },
        onSelectionChanged: (e) => {
          const selectedIndex = e.component.option('selectedIndex');
          this.dispose();

          switch (selectedIndex) {
            case 0: {
              this.buildCpuTabContent();
              break;
            }
            case 1: {
              this.buildSystemInfoTabContent();
              break;
            }
            case 2: {
              this.buildSettingsTab();
              break;
            }

            default:
              break;
          }
        },
      });
    }
  };

  dispose = () => {
    if (this.sparklineIntervalTimer !== null) {
      clearInterval(this.sparklineIntervalTimer);
      this.sparklineIntervalTimer = null;
    }

    if (this.sparkline !== null) {
      this.sparkline.dispose();
      this.sparkline = null;
      (document.querySelector('[data-core-cpu-progress]') as HTMLElement).innerHTML = '';
      this.cpuUsages = [];
    }

    if (this.cpuUsageProgressBar !== null) {
      this.cpuUsageProgressBar.dispose();
      this.cpuUsageProgressBar = null;
    }
    if (this.cpuFreeProgressBar !== null) {
      this.cpuFreeProgressBar.dispose();
      this.cpuFreeProgressBar = null;
    }
  };

  buildCpuTabContent = () => {

    const cpuUsageProgressBarContainerElement = document.querySelector('[data-core-cpu-usage-progress-bar]');

    if (cpuUsageProgressBarContainerElement) {
      this.cpuUsageProgressBar = new ProgressBar(cpuUsageProgressBarContainerElement, {
        width: '100%',
        statusFormat: (ratio, value) => `CPU usage: ${(ratio * 100).toFixedNumber(2, 10)} %`,
      });
    }

    const cpuFreeProgressBarContainerElement = document.querySelector('[data-core-cpu-free-progress-bar]');

    if (cpuFreeProgressBarContainerElement) {
      this.cpuFreeProgressBar = new ProgressBar(cpuFreeProgressBarContainerElement, {
        width: '100%',
        statusFormat: (ratio, value) => `CPU free: ${(ratio * 100).toFixedNumber(2, 10)} %`,
      });
    }

    const cpuProgressContainerElement = document.querySelector('[data-core-cpu-progress]');
    if (cpuProgressContainerElement) {
      this.sparkline = new SparklineChart(cpuProgressContainerElement, {
        dataSource: this.cpuUsages,
        commonSeriesSettings: {
          color: this.currentTheme && this.currentTheme.indexOf('orange') > 0 ? 'orangered' : 'teal',
        },
      });
    }

    (document.querySelector('[data-core-cpu-progress]') as HTMLElement).style.display = 'none';

    let awaiter = setTimeout(() => {
      (document.querySelector('[data-core-cpu-progress]') as HTMLElement).style.display = 'block';
      if (this.sparkline) {
        this.sparkline.render({
          force: true,
          animate: true,
          asyncSeriesRendering: true,
        });
      }
      clearTimeout(awaiter);
    }, 500);

    this.sparklineIntervalTimer = setInterval(async () => {
      const cpuUsage = await cpu.usage();

      this.cpuUsages.push({
        time: new Date(),
        value: cpuUsage,
      });

      if (this.cpuUsages.length >= 100) {
        this.cpuUsages.shift();
      }

      if (this.sparkline !== null) {
        if (this.cpuUsages.length >= 5) {
          this.sparkline.option('dataSource', this.cpuUsages);
        }
      }

      if (this.cpuFreeProgressBar && this.cpuUsageProgressBar) {
        this.cpuUsageProgressBar.option('value', cpuUsage);
        this.cpuFreeProgressBar.option('value', await cpu.free());
      }

      if (cpuUsage > this.settings.cpuOverloading) {
        if (this.lastNotificationDateTime === null || (this.lastNotificationDateTime !== null && Date.compare(this.lastNotificationDateTime, new Date()) === -1)) {
          new Notification('SysTop Notification', {
            body: `CPU overloaded ${cpuUsage} percent`,
            icon: `./assets/icons/icon.png`,
          });
          this.lastNotificationDateTime = new Date().addSeconds(this.settings.alertInterval);
        }
      }
    }, 1000);
  };

  buildSystemInfoTabContent = async () => {
    (document.querySelector('[data-core-model]') as HTMLElement).innerHTML = `CPU model: ${cpu.model()}`;
    (document.querySelector('[data-core-host]') as HTMLElement).innerHTML = `Hostname: ${os.hostname()}`;
    (document.querySelector('[data-core-os]') as HTMLElement).innerHTML = `OS info: ${os.type()} (${os.arch()})`;
    (document.querySelector('[data-core-mem]') as HTMLElement).innerHTML = `Total memory: ${(await mem.info()).totalMemMb} MBytes`;
    (document.querySelector('[data-core-uptime]') as HTMLElement).innerHTML = `System uptime: ${new Date().clearTime().addSeconds(os.uptime()).toString('H:mm:ss')}`;
  };

  buildSettingsTab = () => {
    const settingsFormContainerElement = document.querySelector('[data-core-settings]');
    if (settingsFormContainerElement) {

      new Form(settingsFormContainerElement, {
        formData: this.settings,
        items: [
          {
            name: 'cpuOverloading',
            dataField: 'cpuOverloading',
            editorType: 'dxNumberBox',
            label: {
              text: 'CPU Loading',
              showColon: true,
            },

            editorOptions: {
              showSpinButtons: true,
              showClearButton: true,
              min: 0,
              max: 100,
            },
          },
          {
            name: 'alertInterval',
            dataField: 'alertInterval',
            editorType: 'dxNumberBox',
            label: {
              text: 'Alert interval',
              showColon: true,
            },
            editorOptions: {
              showSpinButtons: true,
              showClearButton: true,
              min: 10,
              max: 120,
            },
          },
          {
            name: 'saveButton',
            buttonOptions: {
              type: 'danger',
              text: 'Save',
              width: '100%',
              onClick: () => {
                ipcRenderer.invoke('settings:save', this.settings);
              },
            },
          } as ButtonItem,
        ],
      });
    }
  };

  execute = async () => {
    ipcRenderer.on('settings:response', (e, data) => {
      this.settings = data;
    });

    await ipcRenderer.invoke('settings:request');

    this.buildMenu();
    this.buildTabPanel();

    this.buildCpuTabContent();
  };
}
