/**
 * Feature settings section
 * Navigation, borders, headings, links, etc.
 */

import { Setting } from 'obsidian';
import MinimalTheme from '../../main';

export function buildFeatureSettings(containerEl: HTMLElement, plugin: MinimalTheme): void {
  containerEl.createEl('br');

  const featuresSection = containerEl.createEl('div', {cls: 'setting-item setting-item-heading'});
  const featuresSectionInfo = featuresSection.createEl('div', {cls: 'setting-item-info'});
  featuresSectionInfo.createEl('div', {text: 'Features', cls: 'setting-item-name'});

  const featuresSectionDesc = featuresSectionInfo.createEl('div', {cls: 'setting-item-description'});
  featuresSectionDesc.appendChild(
    createEl('span', {
      text: 'See '
    })
  );
  featuresSectionDesc.appendChild(
    createEl('a', {
      text: "documentation",
      href: "https://minimal.guide",
    })
  );
  featuresSectionDesc.appendText(' for details.');

  new Setting(containerEl)
    .setName('Text labels for primary navigation')
    .setDesc('Navigation items in the left sidebar uses text labels.')
    .addToggle(toggle => toggle.setValue(plugin.settings.labeledNav)
      .onChange((value) => {
        plugin.settings.labeledNav = value;
        plugin.saveData(plugin.settings);
        plugin.refresh();
      }));

  new Setting(containerEl)
    .setName('Colorful window frame')
    .setDesc('The top area of the app uses your accent color.')
    .addToggle(toggle => toggle.setValue(plugin.settings.colorfulFrame)
      .onChange((value) => {
        plugin.settings.colorfulFrame = value;
        plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  new Setting(containerEl)
    .setName('Colorful active states')
    .setDesc('Active file and menu items use your accent color.')
    .addToggle(toggle => toggle.setValue(plugin.settings.colorfulActiveStates)
      .onChange((value) => {
        plugin.settings.colorfulActiveStates = value;
        plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  new Setting(containerEl)
    .setName('Colorful headings')
    .setDesc('Headings use a different color for each size.')
    .addToggle(toggle => toggle.setValue(plugin.settings.colorfulHeadings)
      .onChange((value) => {
        plugin.settings.colorfulHeadings = value;
        plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  new Setting(containerEl)
    .setName('Minimal status bar')
    .setDesc('Turn off to use full-width status bar.')
    .addToggle(toggle => toggle.setValue(plugin.settings.minimalStatus)
      .onChange((value) => {
        plugin.settings.minimalStatus = value;
        plugin.saveData(plugin.settings);
        plugin.refresh();
      }));

  new Setting(containerEl)
    .setName('Trim file names in sidebars')
    .setDesc('Use ellipses to fit file names on a single line.')
    .addToggle(toggle => toggle.setValue(plugin.settings.trimNames)
      .onChange((value) => {
        plugin.settings.trimNames = value;
        plugin.saveData(plugin.settings);
        plugin.refresh();
      }));

  new Setting(containerEl)
    .setName('Workspace borders')
    .setDesc('Display divider lines between workspace elements.')
    .addToggle(toggle => toggle.setValue(plugin.settings.bordersToggle)
      .onChange((value) => {
        plugin.settings.bordersToggle = value;
        plugin.saveData(plugin.settings);
        plugin.refresh();
      }));

  new Setting(containerEl)
    .setName('Focus mode')
    .setDesc('Hide tab bar and status bar, hover to display. Can be toggled via hotkey.')
    .addToggle(toggle => toggle.setValue(plugin.settings.focusMode)
      .onChange((value) => {
        plugin.settings.focusMode = value;
        plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  new Setting(containerEl)
    .setName('Underline internal links')
    .setDesc('Show underlines on internal links.')
    .addToggle(toggle => toggle.setValue(plugin.settings.underlineInternal)
      .onChange((value) => {
        plugin.settings.underlineInternal = value;
        plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  new Setting(containerEl)
    .setName('Underline external links')
    .setDesc('Show underlines on external links.')
    .addToggle(toggle => toggle.setValue(plugin.settings.underlineExternal)
      .onChange((value) => {
        plugin.settings.underlineExternal = value;
        plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  new Setting(containerEl)
    .setName('Maximize media')
    .setDesc('Images and videos fill the width of the line.')
    .addToggle(toggle => toggle.setValue(plugin.settings.fullWidthMedia)
      .onChange((value) => {
        plugin.settings.fullWidthMedia = value;
        plugin.saveData(plugin.settings);
        plugin.refresh();
      }));
}

