import { SettingGroup } from "obsidian";
/**
 * Layout settings section
 * Image grids and block width settings (charts, iframes, images, maps, tables)
 */

import MinimalTheme from '../../main';


export function buildLayoutSettings(containerEl: HTMLElement, plugin: MinimalTheme): void {
  const layoutGroup = new SettingGroup(containerEl).setHeading('Layout');

  layoutGroup.addSetting(setting => {
    setting
      .setName('Image grids')
      // False positive: "Documentation" is a proper noun (section name)
      // eslint-disable-next-line obsidianmd/ui/sentence-case
      .setDesc('Turn consecutive images into columns — to make a new row, add an extra line break between images. These options can also be defined on a per-file basis, see Documentation for details.')
      .addToggle(toggle => {
        toggle.setValue(plugin.settings.imgGrid).onChange(value => {
          plugin.settings.imgGrid = value;
          void plugin.saveData(plugin.settings);
          plugin.refresh();
        });
      });
  });

  layoutGroup.addSetting(setting => {
    setting
      .setName('Chart width')
      .setDesc('Default width for chart blocks.')
      .addDropdown(dropdown => {
        dropdown
          .addOption('chart-default-width', 'Default')
          .addOption('chart-wide', 'Wide line width')
          .addOption('chart-max', 'Maximum line width')
          .addOption('chart-100', '100% pane width')
          .setValue(plugin.settings.chartWidth)
          .onChange(value => {
            plugin.settings.chartWidth = value;
            void plugin.saveData(plugin.settings);
            plugin.refresh();
          });
      });
  });

  layoutGroup.addSetting(setting => {
    setting
      .setName('Iframe width')
      .setDesc('Default width for iframe blocks.')
      .addDropdown(dropdown => {
        dropdown
          .addOption('iframe-default-width', 'Default')
          .addOption('iframe-wide', 'Wide line width')
          .addOption('iframe-max', 'Maximum line width')
          .addOption('iframe-100', '100% pane width')
          .setValue(plugin.settings.iframeWidth)
          .onChange(value => {
            plugin.settings.iframeWidth = value;
            void plugin.saveData(plugin.settings);
            plugin.refresh();
          });
      });
  });

  layoutGroup.addSetting(setting => {
    setting
      .setName('Image width')
      .setDesc('Default width for image blocks.')
      .addDropdown(dropdown => {
        dropdown
          .addOption('img-default-width', 'Default')
          .addOption('img-wide', 'Wide line width')
          .addOption('img-max', 'Maximum line width')
          .addOption('img-100', '100% pane width')
          .setValue(plugin.settings.imgWidth)
          .onChange(value => {
            plugin.settings.imgWidth = value;
            void plugin.saveData(plugin.settings);
            plugin.refresh();
          });
      });
  });

  layoutGroup.addSetting(setting => {
    setting
      .setName('Map width')
      .setDesc('Default width for map blocks.')
      .addDropdown(dropdown => {
        dropdown
          .addOption('map-default-width', 'Default')
          .addOption('map-wide', 'Wide line width')
          .addOption('map-max', 'Maximum line width')
          .addOption('map-100', '100% pane width')
          .setValue(plugin.settings.mapWidth)
          .onChange(value => {
            plugin.settings.mapWidth = value;
            void plugin.saveData(plugin.settings);
            plugin.refresh();
          });
      });
  });

  layoutGroup.addSetting(setting => {
    setting
      .setName('Table width')
      // False positive: "Dataview" is a proper noun (plugin name)
      // eslint-disable-next-line obsidianmd/ui/sentence-case
      .setDesc('Default width for table and Dataview blocks.')
      .addDropdown(dropdown => {
        dropdown
          .addOption('table-default-width', 'Default')
          .addOption('table-wide', 'Wide line width')
          .addOption('table-max', 'Maximum line width')
          .addOption('table-100', '100% pane width')
          .setValue(plugin.settings.tableWidth)
          .onChange(value => {
            plugin.settings.tableWidth = value;
            void plugin.saveData(plugin.settings);
            plugin.refresh();
          });
      });
  });
}

