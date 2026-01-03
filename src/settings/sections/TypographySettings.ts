/**
 * Typography settings section
 * Font sizes, line height, line widths, editor font
 */

import MinimalTheme from '../../main';
import { createSettingsGroup } from '../../utils/settings-compat';

export function buildTypographySettings(containerEl: HTMLElement, plugin: MinimalTheme): void {
  const typographyGroup = createSettingsGroup(containerEl, 'Typography', 'oxygen-settings');

  typographyGroup.addSetting((setting) => {
    setting
      .setName('Text font size')
      .setDesc('Used for the main text (default 16).')
      .addText((text) => {
        text
          .setPlaceholder('16')
          .setValue((plugin.settings.textNormal || '') + '')
          .onChange(async (value) => {
            plugin.settings.textNormal = parseFloat(value);
            void plugin.saveData(plugin.settings);
            plugin.setFontSize();
          });
      });
  });

  typographyGroup.addSetting((setting) => {
    setting
      .setName('Small font size')
      .setDesc('Used for text in the sidebars and tabs (default 13).')
      .addText((text) => {
        text
          .setPlaceholder('13')
          .setValue((plugin.settings.textSmall || '') + '')
          .onChange(async (value) => {
            plugin.settings.textSmall = parseFloat(value);
            void plugin.saveData(plugin.settings);
            plugin.refresh();
          });
      });
  });

  typographyGroup.addSetting((setting) => {
    setting
      .setName('Line height')
      .setDesc('Line height of text (default 1.5).')
      .addText((text) => {
        text
          .setPlaceholder('1.5')
          .setValue((plugin.settings.lineHeight || '') + '')
          .onChange(async (value) => {
            plugin.settings.lineHeight = parseFloat(value);
            void plugin.saveData(plugin.settings);
            plugin.refresh();
          });
      });
  });

  typographyGroup.addSetting((setting) => {
    setting
      .setName('Normal line width')
      .setDesc('Number of characters per line (default 40).')
      .addText((text) => {
        text
          .setPlaceholder('40')
          .setValue((plugin.settings.lineWidth || '') + '')
          .onChange(async (value) => {
            plugin.settings.lineWidth = parseInt(value.trim());
            void plugin.saveData(plugin.settings);
            plugin.refresh();
          });
      });
  });

  typographyGroup.addSetting((setting) => {
    setting
      .setName('Wide line width')
      .setDesc('Number of characters per line for wide elements (default 50).')
      .addText((text) => {
        text
          .setPlaceholder('50')
          .setValue((plugin.settings.lineWidthWide || '') + '')
          .onChange(async (value) => {
            plugin.settings.lineWidthWide = parseInt(value.trim());
            void plugin.saveData(plugin.settings);
            plugin.refresh();
          });
      });
  });

  typographyGroup.addSetting((setting) => {
    setting
      .setName('Maximum line width %')
      .setDesc('Percentage of space inside a pane that a line can fill (default 88).')
      .addText((text) => {
        text
          .setPlaceholder('88')
          .setValue((plugin.settings.maxWidth || '') + '')
          .onChange(async (value) => {
            plugin.settings.maxWidth = parseInt(value.trim());
            void plugin.saveData(plugin.settings);
            plugin.refresh();
          });
      });
  });

  typographyGroup.addSetting((setting) => {
    setting
      .setName('Editor font')
      .setDesc('Overrides the text font defined in Obsidian appearance settings when in edit mode.')
      .addText((text) => {
        text
          .setPlaceholder('')
          .setValue((plugin.settings.editorFont || '') + '')
          .onChange(async (value) => {
            plugin.settings.editorFont = value;
            void plugin.saveData(plugin.settings);
            plugin.refresh();
          });
      });
  });
}

