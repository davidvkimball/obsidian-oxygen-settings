/**
 * Typography settings section
 * Font sizes, line height, line widths, editor font
 */

import { Setting } from 'obsidian';
import MinimalTheme from '../../main';

export function buildTypographySettings(containerEl: HTMLElement, plugin: MinimalTheme): void {
  containerEl.createEl('br');
  containerEl.createEl('div', {text: 'Typography', cls: 'setting-item setting-item-heading'});

  new Setting(containerEl)
    .setName('Text font size')
    .setDesc('Used for the main text (default 16).')
    .addText(text => text.setPlaceholder('16')
      .setValue((plugin.settings.textNormal || '') + '')
      .onChange((value) => {
        plugin.settings.textNormal = parseFloat(value);
        plugin.saveData(plugin.settings);
        plugin.setFontSize();
      }));

  new Setting(containerEl)
    .setName('Small font size')
    .setDesc('Used for text in the sidebars and tabs (default 13).')
    .addText(text => text.setPlaceholder('13')
      .setValue((plugin.settings.textSmall || '') + '')
      .onChange((value) => {
        plugin.settings.textSmall = parseFloat(value);
        plugin.saveData(plugin.settings);
        plugin.refresh();
      }));

  new Setting(containerEl)
    .setName('Line height')
    .setDesc('Line height of text (default 1.5).')
    .addText(text => text.setPlaceholder('1.5')
      .setValue((plugin.settings.lineHeight || '') + '')
      .onChange((value) => {
        plugin.settings.lineHeight = parseFloat(value);
        plugin.saveData(plugin.settings);
        plugin.refresh();
      }));

  new Setting(containerEl)
    .setName('Normal line width')
    .setDesc('Number of characters per line (default 40).')
    .addText(text => text.setPlaceholder('40')
      .setValue((plugin.settings.lineWidth || '') + '')
      .onChange((value) => {
        plugin.settings.lineWidth = parseInt(value.trim());
        plugin.saveData(plugin.settings);
        plugin.refresh();
      }));

  new Setting(containerEl)
    .setName('Wide line width')
    .setDesc('Number of characters per line for wide elements (default 50).')
    .addText(text => text.setPlaceholder('50')
      .setValue((plugin.settings.lineWidthWide || '') + '')
      .onChange((value) => {
        plugin.settings.lineWidthWide = parseInt(value.trim());
        plugin.saveData(plugin.settings);
        plugin.refresh();
      }));

  new Setting(containerEl)
    .setName('Maximum line width %')
    .setDesc('Percentage of space inside a pane that a line can fill (default 88).')
    .addText(text => text.setPlaceholder('88')
      .setValue((plugin.settings.maxWidth || '') + '')
      .onChange((value) => {
        plugin.settings.maxWidth = parseInt(value.trim());
        plugin.saveData(plugin.settings);
        plugin.refresh();
      }));

  new Setting(containerEl)
    .setName('Editor font')
    .setDesc('Overrides the text font defined in Obsidian Appearance settings when in edit mode.')
    .addText(text => text.setPlaceholder('')
      .setValue((plugin.settings.editorFont || '') + '')
      .onChange((value) => {
        plugin.settings.editorFont = value;
        plugin.saveData(plugin.settings);
        plugin.refresh();
      }));
}

