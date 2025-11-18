/**
 * Hider settings section
 * Hide UI elements for distraction-free writing
 */

import { Setting } from 'obsidian';
import MinimalTheme from '../../main';

export function buildHiderSettings(containerEl: HTMLElement, plugin: MinimalTheme): void {
  containerEl.createEl('br');

  const hiderSection = containerEl.createEl('div', {cls: 'setting-item setting-item-heading'});
  const hiderSectionInfo = hiderSection.createEl('div', {cls: 'setting-item-info'});
  hiderSectionInfo.createEl('div', {text: 'Hider', cls: 'setting-item-name'});

  // Focus mode
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

  // Auto-hide title bar
  new Setting(containerEl)
    .setName('Auto-hide title bar')
    .setDesc('Hide title bar until hover. Turn off to always show.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideTitleBarOnHover)
      .onChange((value) => {
        plugin.settings.hideTitleBarOnHover = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      }));

  // Auto-hide file explorer nav header
  new Setting(containerEl)
    .setName('Auto-hide file explorer nav header')
    .setDesc('Hide file explorer navigation header until hover. Elegantly reveals on hover.')
    .addToggle(toggle => toggle.setValue(plugin.settings.autoHideFileExplorerNavHeader)
      .onChange((value) => {
        plugin.settings.autoHideFileExplorerNavHeader = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      }));

  // Auto-hide other nav headers
  new Setting(containerEl)
    .setName('Auto-hide other nav headers')
    .setDesc('Hide navigation headers for tag, backlinks, outgoing links, outline, and bookmarks panes until hover.')
    .addToggle(toggle => toggle.setValue(plugin.settings.autoHideOtherNavHeaders)
      .onChange((value) => {
        plugin.settings.autoHideOtherNavHeaders = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      }));

  // Auto-hide left tab headers
  new Setting(containerEl)
    .setName('Auto-hide left tab headers')
    .setDesc('Hide left panel tab headers until hover. Elegantly reveals on hover.')
    .addToggle(toggle => toggle.setValue(plugin.settings.autoHideLeftTabHeaders)
      .onChange((value) => {
        plugin.settings.autoHideLeftTabHeaders = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      }));

  // Auto-hide right tab headers
  new Setting(containerEl)
    .setName('Auto-hide right tab headers')
    .setDesc('Hide right panel tab headers until hover. Elegantly reveals on hover.')
    .addToggle(toggle => toggle.setValue(plugin.settings.autoHideRightTabHeaders)
      .onChange((value) => {
        plugin.settings.autoHideRightTabHeaders = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      }));

  // Hide tab bar
  new Setting(containerEl)
    .setName('Hide tab bar')
    .setDesc('Hides the tab container at the top of the window.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideTabs)
      .onChange((value) => {
        plugin.settings.hideTabs = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide status bar
  new Setting(containerEl)
    .setName('Hide status bar')
    .setDesc('Hides word count, character count and backlink count.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideStatus)
      .onChange((value) => {
        plugin.settings.hideStatus = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide vault name
  new Setting(containerEl)
    .setName('Hide vault name')
    .setDesc('Hides your vault profile. Warning: this also hides access to the Settings and vault switcher icons. You can use hotkeys or the command palette to open them.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideVault)
      .onChange((value) => {
        plugin.settings.hideVault = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide scroll bars
  new Setting(containerEl)
    .setName('Hide scroll bars')
    .setDesc('Hides all scroll bars.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideScroll)
      .onChange((value) => {
        plugin.settings.hideScroll = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide sidebar toggle buttons
  new Setting(containerEl)
    .setName('Hide sidebar toggle buttons')
    .setDesc('Hides both sidebar buttons.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideSidebarButtons)
      .onChange((value) => {
        plugin.settings.hideSidebarButtons = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide tooltips
  new Setting(containerEl)
    .setName('Hide tooltips')
    .setDesc('Hides all tooltips.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideTooltips)
      .onChange((value) => {
        plugin.settings.hideTooltips = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide file explorer buttons
  new Setting(containerEl)
    .setName('Hide file explorer buttons')
    .setDesc('Hides buttons at the top of file explorer (new file, new folder, etc).')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideFileNavButtons)
      .onChange((value) => {
        plugin.settings.hideFileNavButtons = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Collapse other nav headers
  new Setting(containerEl)
    .setName('Collapse all other navigation bars')
    .setDesc('Collapse navigation bars (excluding file explorer) to a small indicator until hover.')
    .addToggle(toggle => toggle.setValue(plugin.settings.collapseOtherNavHeaders)
      .onChange((value) => {
        plugin.settings.collapseOtherNavHeaders = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide instructions
  new Setting(containerEl)
    .setName('Hide instructions')
    .setDesc('Hides instructional tips in modals.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideInstructions)
      .onChange((value) => {
        plugin.settings.hideInstructions = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide search suggestions
  new Setting(containerEl)
    .setName('Hide search suggestions')
    .setDesc('Hides suggestions in search pane.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideSearchSuggestions)
      .onChange((value) => {
        plugin.settings.hideSearchSuggestions = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide count of search term matches
  new Setting(containerEl)
    .setName('Hide count of search term matches')
    .setDesc('Hides the number of matches within each search result.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideSearchCounts)
      .onChange((value) => {
        plugin.settings.hideSearchCounts = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide properties in Reading view
  new Setting(containerEl)
    .setName('Hide properties in Reading view')
    .setDesc('Hides the properties section in Reading view.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hidePropertiesReading)
      .onChange((value) => {
        plugin.settings.hidePropertiesReading = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide properties heading
  new Setting(containerEl)
    .setName('Hide properties heading')
    .setDesc('Hide "Properties" heading above properties.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hidePropertiesHeading)
      .onChange((value) => {
        plugin.settings.hidePropertiesHeading = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide "Add property" button
  new Setting(containerEl)
    .setName('Hide "Add property" button')
    .setDesc('Hide "Add property" button below properties.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideAddPropertyButton)
      .onChange((value) => {
        plugin.settings.hideAddPropertyButton = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Auto-hide vault switcher
  new Setting(containerEl)
    .setName('Auto-hide vault switcher')
    .setDesc('Hide vault switcher until hover. Does not work when "Hide vault name" is enabled.')
    .addToggle(toggle => toggle.setValue(plugin.settings.autoHideVaultSwitcher)
      .onChange((value) => {
        plugin.settings.autoHideVaultSwitcher = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Auto-hide settings button
  new Setting(containerEl)
    .setName('Auto-hide settings button')
    .setDesc('Hide settings button until hover. Elegantly reveals on hover.')
    .addToggle(toggle => toggle.setValue(plugin.settings.autoHideSettingsButton)
      .onChange((value) => {
        plugin.settings.autoHideSettingsButton = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide help button
  new Setting(containerEl)
    .setName('Hide help button')
    .setDesc('Hides the help button in the vault profile area.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideHelpButton)
      .onChange((value) => {
        plugin.settings.hideHelpButton = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );
}

