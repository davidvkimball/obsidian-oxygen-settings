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
      text: "Documentation",
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
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      }));

  new Setting(containerEl)
    .setName('Colorful window frame')
    .setDesc('The top area of the app uses your accent color.')
    .addToggle(toggle => toggle.setValue(plugin.settings.colorfulFrame)
      .onChange((value) => {
        plugin.settings.colorfulFrame = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  new Setting(containerEl)
    .setName('Colorful active states')
    .setDesc('Active file and menu items use your accent color.')
    .addToggle(toggle => toggle.setValue(plugin.settings.colorfulActiveStates)
      .onChange((value) => {
        plugin.settings.colorfulActiveStates = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  new Setting(containerEl)
    .setName('Colorful headings')
    .setDesc('Headings use a different color for each size.')
    .addToggle(toggle => toggle.setValue(plugin.settings.colorfulHeadings)
      .onChange((value) => {
        plugin.settings.colorfulHeadings = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  new Setting(containerEl)
    .setName('Minimal status bar')
    .setDesc('Turn off to use full-width status bar.')
    .addToggle(toggle => toggle.setValue(plugin.settings.minimalStatus)
      .onChange((value) => {
        plugin.settings.minimalStatus = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      }));

  new Setting(containerEl)
    .setName('Trim file names in sidebars')
    .setDesc('Use ellipses to fit file names on a single line.')
    .addToggle(toggle => toggle.setValue(plugin.settings.trimNames)
      .onChange((value) => {
        plugin.settings.trimNames = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      }));

  // Workspace Borders
  new Setting(containerEl)
    .setName('Borders')
    .setDesc('Border style for workspace elements.')
    .addDropdown(dropdown => dropdown
      .addOption('enhanced', 'Enhanced')
      .addOption('default', 'Default')
      .addOption('none', 'None')
      .setValue(plugin.settings.workspaceBorders)
      .onChange((value) => {
        plugin.settings.workspaceBorders = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Sidebar Indentation Guides
  new Setting(containerEl)
    .setName('Indentation guides thickness')
    .setDesc('Thickness of indentation guides in the sidebar file explorer.')
    .addDropdown(dropdown => dropdown
      .addOption('0px', 'None')
      .addOption('1px', 'Thin')
      .addOption('2px', 'Medium')
      .addOption('3px', 'Thick')
      .setValue(plugin.settings.navIndentationGuideWidth)
      .onChange((value) => {
        plugin.settings.navIndentationGuideWidth = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  new Setting(containerEl)
    .setName('Indentation guides color')
    .setDesc('Color of indentation guides in the sidebar.')
    .addDropdown(dropdown => dropdown
      .addOption('rgba(var(--mono-rgb-100), 0.12)', 'Subtle')
      .addOption('var(--text-faint)', 'Strong')
      .addOption('var(--color-accent)', 'Accent color')
      .setValue(plugin.settings.navIndentationGuideColor)
      .onChange((value) => {
        plugin.settings.navIndentationGuideColor = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  new Setting(containerEl)
    .setName('Focus mode')
    .setDesc('Hide tab bar and status bar, hover to display. Can be toggled via hotkey.')
    .addToggle(toggle => toggle.setValue(plugin.settings.focusMode)
      .onChange((value) => {
        plugin.settings.focusMode = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  new Setting(containerEl)
    .setName('Underline internal links')
    .setDesc('Show underlines on internal links.')
    .addToggle(toggle => toggle.setValue(plugin.settings.underlineInternal)
      .onChange((value) => {
        plugin.settings.underlineInternal = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  new Setting(containerEl)
    .setName('Underline external links')
    .setDesc('Show underlines on external links.')
    .addToggle(toggle => toggle.setValue(plugin.settings.underlineExternal)
      .onChange((value) => {
        plugin.settings.underlineExternal = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  new Setting(containerEl)
    .setName('Maximize media')
    .setDesc('Images and videos fill the width of the line.')
    .addToggle(toggle => toggle.setValue(plugin.settings.fullWidthMedia)
      .onChange((value) => {
        plugin.settings.fullWidthMedia = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      }));

  new Setting(containerEl)
    .setName('Auto-hide title bar')
    .setDesc('Hide title bar until hover. Turn off to always show.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideTitleBarOnHover)
      .onChange((value) => {
        plugin.settings.hideTitleBarOnHover = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      }));
}

