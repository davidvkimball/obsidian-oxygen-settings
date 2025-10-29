/**
 * Layout settings section
 * Image grids and block width settings (charts, iframes, images, maps, tables)
 */

import { Setting } from 'obsidian';
import MinimalTheme from '../../main';

export function buildLayoutSettings(containerEl: HTMLElement, plugin: MinimalTheme): void {
  containerEl.createEl('br');

  const layoutSection = containerEl.createEl('div', {cls: 'setting-item setting-item-heading'});
  const layoutSectionInfo = layoutSection.createEl('div', {cls: 'setting-item-info'});
  layoutSectionInfo.createEl('div', {text: 'Layout', cls: 'setting-item-name'});

  const layoutSectionDesc = layoutSectionInfo.createEl('div', {cls: 'setting-item-description'});
  layoutSectionDesc.appendChild(
    createEl('span', {
      text: 'These options can also be defined on a per-file basis, see '
    })
  );
  layoutSectionDesc.appendChild(
    createEl('a', {
      text: "documentation",
      href: "https://minimal.guide/features/block-width",
    })
  );
  layoutSectionDesc.appendText(' for details.');

  new Setting(containerEl)
    .setName('Image grids')
    .setDesc('Turn consecutive images into columns — to make a new row, add an extra line break between images.')
    .addToggle(toggle => toggle.setValue(plugin.settings.imgGrid)
      .onChange((value) => {
        plugin.settings.imgGrid = value;
        plugin.saveData(plugin.settings);
        plugin.refresh();
      }));

  new Setting(containerEl)
    .setName('Chart width')
    .setDesc('Default width for chart blocks.')
    .addDropdown(dropdown => dropdown
      .addOption('chart-default-width','Default')
      .addOption('chart-wide','Wide line width')
      .addOption('chart-max','Maximum line width')
      .addOption('chart-100','100% pane width')
      .setValue(plugin.settings.chartWidth)
      .onChange((value) => {
        plugin.settings.chartWidth = value;
        plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  new Setting(containerEl)
    .setName('Iframe width')
    .setDesc('Default width for iframe blocks.')
    .addDropdown(dropdown => dropdown
      .addOption('iframe-default-width','Default')
      .addOption('iframe-wide','Wide line width')
      .addOption('iframe-max','Maximum line width')
      .addOption('iframe-100','100% pane width')
      .setValue(plugin.settings.iframeWidth)
      .onChange((value) => {
        plugin.settings.iframeWidth = value;
        plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  new Setting(containerEl)
    .setName('Image width')
    .setDesc('Default width for image blocks.')
    .addDropdown(dropdown => dropdown
      .addOption('img-default-width','Default')
      .addOption('img-wide','Wide line width')
      .addOption('img-max','Maximum line width')
      .addOption('img-100','100% pane width')
      .setValue(plugin.settings.imgWidth)
      .onChange((value) => {
        plugin.settings.imgWidth = value;
        plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  new Setting(containerEl)
    .setName('Map width')
    .setDesc('Default width for map blocks.')
    .addDropdown(dropdown => dropdown
      .addOption('map-default-width','Default')
      .addOption('map-wide','Wide line width')
      .addOption('map-max','Maximum line width')
      .addOption('map-100','100% pane width')
      .setValue(plugin.settings.mapWidth)
      .onChange((value) => {
        plugin.settings.mapWidth = value;
        plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  new Setting(containerEl)
    .setName('Table width')
    .setDesc('Default width for table and Dataview blocks.')
    .addDropdown(dropdown => dropdown
      .addOption('table-default-width','Default')
      .addOption('table-wide','Wide line width')
      .addOption('table-max','Maximum line width')
      .addOption('table-100','100% pane width')
      .setValue(plugin.settings.tableWidth)
      .onChange((value) => {
        plugin.settings.tableWidth = value;
        plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );
}

