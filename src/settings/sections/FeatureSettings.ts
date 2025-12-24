/**
 * Feature settings section
 * Navigation, borders, headings, links, etc.
 */

import MinimalTheme from '../../main';
import { MinimalSettings } from '../settings-interface';
import { createSettingsGroup } from '../../utils/settings-compat';

export function buildFeatureSettings(containerEl: HTMLElement, plugin: MinimalTheme): void {
  const featuresGroup = createSettingsGroup(containerEl, 'Features');

  featuresGroup.addSetting((setting) => {
    setting
      .setName('Text labels for primary navigation')
      // False positive: "Documentation" is a proper noun (section name)
      // eslint-disable-next-line obsidianmd/ui/sentence-case
      .setDesc('Navigation items in the left sidebar uses text labels. See Documentation for details.')
      .addToggle((toggle) => {
        toggle.setValue(plugin.settings.labeledNav).onChange(async (value) => {
          plugin.settings.labeledNav = value;
          void plugin.saveData(plugin.settings);
          plugin.refresh();
        });
      });
  });

  featuresGroup.addSetting((setting) => {
    setting
      .setName('Colorful window frame')
      .setDesc('The top area of the app uses your accent color.')
      .addToggle((toggle) => {
        toggle.setValue(plugin.settings.colorfulFrame).onChange(async (value) => {
          plugin.settings.colorfulFrame = value;
          void plugin.saveData(plugin.settings);
          plugin.refresh();
        });
      });
  });

  featuresGroup.addSetting((setting) => {
    setting
      .setName('Colorful active states')
      .setDesc('Active file and menu items use your accent color.')
      .addToggle((toggle) => {
        toggle.setValue(plugin.settings.colorfulActiveStates).onChange(async (value) => {
          plugin.settings.colorfulActiveStates = value;
          void plugin.saveData(plugin.settings);
          plugin.refresh();
        });
      });
  });

  featuresGroup.addSetting((setting) => {
    setting
      .setName('Colorful headings')
      .setDesc('Headings use a different color for each size.')
      .addToggle((toggle) => {
        toggle.setValue(plugin.settings.colorfulHeadings).onChange(async (value) => {
          plugin.settings.colorfulHeadings = value;
          void plugin.saveData(plugin.settings);
          plugin.refresh();
        });
      });
  });

  featuresGroup.addSetting((setting) => {
    setting
      .setName('Minimal status bar')
      .setDesc('Turn off to use full-width status bar.')
      .addToggle((toggle) => {
        toggle.setValue(plugin.settings.minimalStatus).onChange(async (value) => {
          plugin.settings.minimalStatus = value;
          void plugin.saveData(plugin.settings);
          plugin.refresh();
        });
      });
  });

  featuresGroup.addSetting((setting) => {
    setting
      .setName('Trim file names in sidebars')
      .setDesc('Use ellipses to fit file names on a single line.')
      .addToggle((toggle) => {
        toggle.setValue(plugin.settings.trimNames).onChange(async (value) => {
          plugin.settings.trimNames = value;
          void plugin.saveData(plugin.settings);
          plugin.refresh();
        });
      });
  });

  featuresGroup.addSetting((setting) => {
    setting
      .setName('Borders')
      .setDesc('Border style for workspace elements.')
      .addDropdown((dropdown) => {
        dropdown
          .addOption('enhanced', 'Enhanced')
          .addOption('default', 'Default')
          .addOption('none', 'None')
          .setValue(plugin.settings.workspaceBorders)
          .onChange(async (value) => {
            plugin.settings.workspaceBorders = value;
            void plugin.saveData(plugin.settings);
            plugin.refresh();
          });
      });
  });

  featuresGroup.addSetting((setting) => {
    setting
      .setName('Indentation guides thickness')
      .setDesc('Thickness of indentation guides in the sidebar file explorer.')
      .addDropdown((dropdown) => {
        dropdown
          .addOption('0px', 'None')
          .addOption('1px', 'Thin')
          .addOption('2px', 'Medium')
          .addOption('3px', 'Thick')
          .setValue(plugin.settings.navIndentationGuideWidth)
          .onChange(async (value) => {
            plugin.settings.navIndentationGuideWidth = value;
            void plugin.saveData(plugin.settings);
            plugin.refresh();
          });
      });
  });

  featuresGroup.addSetting((setting) => {
    setting
      .setName('Indentation guides color')
      .setDesc('Color of indentation guides in the sidebar.')
      .addDropdown((dropdown) => {
        dropdown
          .addOption('rgba(var(--mono-rgb-100), 0.12)', 'Subtle')
          .addOption('var(--text-faint)', 'Strong')
          .addOption('var(--color-accent)', 'Accent color')
          .setValue(plugin.settings.navIndentationGuideColor)
          .onChange(async (value) => {
            plugin.settings.navIndentationGuideColor = value;
            void plugin.saveData(plugin.settings);
            plugin.refresh();
          });
      });
  });

  featuresGroup.addSetting((setting) => {
    setting
      .setName('Underline internal links')
      .setDesc('Show underlines on internal links.')
      .addToggle((toggle) => {
        toggle.setValue(plugin.settings.underlineInternal).onChange(async (value) => {
          plugin.settings.underlineInternal = value;
          void plugin.saveData(plugin.settings);
          plugin.refresh();
        });
      });
  });

  featuresGroup.addSetting((setting) => {
    setting
      .setName('Underline external links')
      .setDesc('Show underlines on external links.')
      .addToggle((toggle) => {
        toggle.setValue(plugin.settings.underlineExternal).onChange(async (value) => {
          plugin.settings.underlineExternal = value;
          void plugin.saveData(plugin.settings);
          plugin.refresh();
        });
      });
  });

  featuresGroup.addSetting((setting) => {
    setting
      .setName('Maximize media')
      .setDesc('Images and videos fill the width of the line.')
      .addToggle((toggle) => {
        toggle.setValue(plugin.settings.fullWidthMedia).onChange(async (value) => {
          plugin.settings.fullWidthMedia = value;
          void plugin.saveData(plugin.settings);
          plugin.refresh();
        });
      });
  });

  featuresGroup.addSetting((setting) => {
    // Ensure enableBlur exists on settings object
    if (!('enableBlur' in plugin.settings)) {
      (plugin.settings as MinimalSettings & { enableBlur?: boolean }).enableBlur = false;
    }
    setting
      .setName('Enable background blur')
      .setDesc('Adds background blur to modal dialogs. Disable if scrolling becomes laggy. Not available on mobile devices.')
      .addToggle((toggle) => {
        toggle.setValue(plugin.settings.enableBlur).onChange(async (value) => {
          plugin.settings.enableBlur = value;
          void plugin.saveData(plugin.settings);
          plugin.refresh();
        });
      });
  });
}

