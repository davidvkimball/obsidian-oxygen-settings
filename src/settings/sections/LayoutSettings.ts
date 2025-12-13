/**
 * Layout settings section
 * Image grids and block width settings (charts, iframes, images, maps, tables)
 */

import { Setting } from 'obsidian';
import MinimalTheme from '../../main';
import { createSettingsGroup } from '../../utils/settings-compat';

export function buildLayoutSettings(containerEl: HTMLElement, plugin: MinimalTheme): void {
  const layoutGroup = createSettingsGroup(containerEl, 'Layout');

  layoutGroup.addSetting((setting) =>
    setting
      .setName('Image grids')
      .setDesc('Turn consecutive images into columns — to make a new row, add an extra line break between images. These options can also be defined on a per-file basis, see Documentation for details.')
      .addToggle((toggle) =>
        toggle.setValue(plugin.settings.imgGrid).onChange(async (value) => {
          plugin.settings.imgGrid = value;
          await plugin.saveData(plugin.settings);
          plugin.refresh();
        })
      )
  );

  layoutGroup.addSetting((setting) =>
    setting
      .setName('Chart width')
      .setDesc('Default width for chart blocks.')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('chart-default-width', 'Default')
          .addOption('chart-wide', 'Wide line width')
          .addOption('chart-max', 'Maximum line width')
          .addOption('chart-100', '100% pane width')
          .setValue(plugin.settings.chartWidth)
          .onChange(async (value) => {
            plugin.settings.chartWidth = value;
            await plugin.saveData(plugin.settings);
            plugin.refresh();
          })
      )
  );

  layoutGroup.addSetting((setting) =>
    setting
      .setName('Iframe width')
      .setDesc('Default width for iframe blocks.')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('iframe-default-width', 'Default')
          .addOption('iframe-wide', 'Wide line width')
          .addOption('iframe-max', 'Maximum line width')
          .addOption('iframe-100', '100% pane width')
          .setValue(plugin.settings.iframeWidth)
          .onChange(async (value) => {
            plugin.settings.iframeWidth = value;
            await plugin.saveData(plugin.settings);
            plugin.refresh();
          })
      )
  );

  layoutGroup.addSetting((setting) =>
    setting
      .setName('Image width')
      .setDesc('Default width for image blocks.')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('img-default-width', 'Default')
          .addOption('img-wide', 'Wide line width')
          .addOption('img-max', 'Maximum line width')
          .addOption('img-100', '100% pane width')
          .setValue(plugin.settings.imgWidth)
          .onChange(async (value) => {
            plugin.settings.imgWidth = value;
            await plugin.saveData(plugin.settings);
            plugin.refresh();
          })
      )
  );

  layoutGroup.addSetting((setting) =>
    setting
      .setName('Map width')
      .setDesc('Default width for map blocks.')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('map-default-width', 'Default')
          .addOption('map-wide', 'Wide line width')
          .addOption('map-max', 'Maximum line width')
          .addOption('map-100', '100% pane width')
          .setValue(plugin.settings.mapWidth)
          .onChange(async (value) => {
            plugin.settings.mapWidth = value;
            await plugin.saveData(plugin.settings);
            plugin.refresh();
          })
      )
  );

  layoutGroup.addSetting((setting) =>
    setting
      .setName('Table width')
      .setDesc('Default width for table and Dataview blocks.')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('table-default-width', 'Default')
          .addOption('table-wide', 'Wide line width')
          .addOption('table-max', 'Maximum line width')
          .addOption('table-100', '100% pane width')
          .setValue(plugin.settings.tableWidth)
          .onChange(async (value) => {
            plugin.settings.tableWidth = value;
            await plugin.saveData(plugin.settings);
            plugin.refresh();
          })
      )
  );
}

