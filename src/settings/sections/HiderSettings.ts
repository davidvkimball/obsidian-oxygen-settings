/**
 * Hider settings section
 * Hide UI elements for distraction-free writing
 */

import { Setting } from 'obsidian';
import MinimalTheme from '../../main';
import { CommandPickerModal } from '../../modals/components/CommandPickerModal';
import { IconPickerModal } from '../../modals/components/IconPickerModal';

export function buildHiderSettings(containerEl: HTMLElement, plugin: MinimalTheme): void {
  containerEl.createEl('br');

  const hiderSection = containerEl.createEl('div', {cls: 'setting-item setting-item-heading'});
  const hiderSectionInfo = hiderSection.createEl('div', {cls: 'setting-item-info'});
  hiderSectionInfo.createEl('div', {text: 'Hider', cls: 'setting-item-name'});

  // ========================================
  // Focus mode
  // ========================================
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

  containerEl.createEl('br');

  // ========================================
  // Auto-hide features (Meridian style)
  // ========================================
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

  // Auto-collapse ribbon
  new Setting(containerEl)
    .setName('Auto-collapse ribbon')
    .setDesc('Collapse the left ribbon to a thin strip until hover. Elegantly expands on hover.')
    .addToggle(toggle => toggle.setValue(plugin.settings.autoCollapseRibbon)
      .onChange((value) => {
        plugin.settings.autoCollapseRibbon = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      }));

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

  // Auto-hide vault switcher background transparency
  new Setting(containerEl)
    .setName('Vault switcher background transparency')
    .setDesc('Adjust the transparency of the vault switcher background when hidden. Range: 0 (fully transparent) to 1 (fully opaque).')
    .addSlider(slider => slider
      .setLimits(0, 1, 0.1)
      .setValue(plugin.settings.autoHideVaultSwitcherBgTransparency)
      .setDynamicTooltip()
      .onChange((value) => {
        plugin.settings.autoHideVaultSwitcherBgTransparency = value;
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

  // Auto-hide tab bar when single tab
  new Setting(containerEl)
    .setName('Auto-hide tab bar when single tab')
    .setDesc('Hide the tab bar automatically when only 1 tab is open. Inspired by Meridian Theme.')
    .addToggle(toggle => toggle.setValue(plugin.settings.autoHideTabBarWhenSingleTab)
      .onChange((value) => {
        plugin.settings.autoHideTabBarWhenSingleTab = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  containerEl.createEl('br');

  // ========================================
  // Vault profile area
  // ========================================
  // Hide help button
  new Setting(containerEl)
    .setName('Hide help button')
    .setDesc('Hides the help button in the vault profile area.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideHelpButton)
      .onChange((value) => {
        plugin.settings.hideHelpButton = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
        // Trigger help button replacement update
        if ((plugin as any).updateHelpButton) {
          void (plugin as any).updateHelpButton();
        }
        // Re-render settings tab to show/hide replacement options
        if (plugin.settingsTab) {
          plugin.settingsTab.display();
        }
      })
    );

  // Replace help button with custom action (only shown when hideHelpButton is enabled)
  if (plugin.settings.hideHelpButton) {
    // Initialize helpButtonReplacement if it doesn't exist
    if (!plugin.settings.helpButtonReplacement) {
      plugin.settings.helpButtonReplacement = {
        enabled: false,
        commandId: 'oxygen-settings:open-settings',
        iconId: 'settings-2',
      };
    }

    // Toggle for enabling replacement
    new Setting(containerEl)
      .setName('Replace help button with custom action')
      .setDesc('Replace the hidden help button with a custom icon and command. Requires "Hide help button" to be enabled.')
      .addToggle(toggle => toggle.setValue(plugin.settings.helpButtonReplacement?.enabled ?? false)
        .onChange(async (value) => {
          if (!plugin.settings.helpButtonReplacement) {
            plugin.settings.helpButtonReplacement = {
              enabled: true,
              commandId: 'oxygen-settings:open-settings',
              iconId: 'settings-2',
            };
          }
          plugin.settings.helpButtonReplacement.enabled = value;
          await plugin.saveData(plugin.settings);
          // Trigger help button replacement update
          if ((plugin as any).updateHelpButton) {
            await (plugin as any).updateHelpButton();
          }
          // Re-render settings tab to show/hide options
          if (plugin.settingsTab) {
            plugin.settingsTab.display();
          }
        })
      );

    // Show command and icon pickers only if replacement is enabled
    if (plugin.settings.helpButtonReplacement?.enabled) {
      // Command picker
      const getCommandName = (commandId: string): string => {
        try {
          const commands = (plugin.app as any).commands;
          if (commands && commands.listCommands) {
            const allCommands = commands.listCommands();
            const command = allCommands.find((cmd: any) => cmd.id === commandId);
            return command?.name || commandId;
          }
        } catch (e) {
          console.warn('[Oxygen Settings] Error getting command name:', e);
        }
        return commandId;
      };

      const commandName = getCommandName(plugin.settings.helpButtonReplacement.commandId);
      new Setting(containerEl)
        .setName('Command')
        .setDesc('Select the command to execute when the button is clicked')
        .addButton(button => button
          .setButtonText(commandName || 'Select command...')
          .onClick(() => {
            const modal = new CommandPickerModal(plugin.app, async (commandId) => {
              if (!plugin.settings.helpButtonReplacement) {
                plugin.settings.helpButtonReplacement = {
                  enabled: true,
                  commandId: '',
                  iconId: 'wrench',
                };
              }
              plugin.settings.helpButtonReplacement.commandId = commandId;
              await plugin.saveData(plugin.settings);
              // Trigger help button replacement update immediately
              if ((plugin as any).updateHelpButton) {
                await (plugin as any).updateHelpButton();
              }
              // Re-render settings tab to show updated command name
              if (plugin.settingsTab) {
                plugin.settingsTab.display();
              }
            });
            modal.open();
          })
        );

      // Icon picker
      const getIconName = (iconId: string): string => {
        if (!iconId) return '';
        // Convert icon ID to a readable name, removing lucide- prefix if present
        return iconId
          .replace(/^lucide-/, '') // Remove lucide- prefix
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

      const iconName = getIconName(plugin.settings.helpButtonReplacement.iconId);
      new Setting(containerEl)
        .setName('Icon')
        .setDesc('Select the icon to display on the button')
        .addButton(button => button
          .setButtonText(iconName || 'Select icon...')
          .onClick(() => {
            const modal = new IconPickerModal(plugin.app, async (iconId) => {
              if (!plugin.settings.helpButtonReplacement) {
                plugin.settings.helpButtonReplacement = {
                  enabled: true,
                  commandId: '',
                  iconId: 'wrench',
                };
              }
              plugin.settings.helpButtonReplacement.iconId = iconId;
              await plugin.saveData(plugin.settings);
              // Trigger help button replacement update immediately
              if ((plugin as any).updateHelpButton) {
                await (plugin as any).updateHelpButton();
              }
              // Re-render settings tab to show updated icon name
              if (plugin.settingsTab) {
                plugin.settingsTab.display();
              }
            });
            modal.open();
          })
        );
    }
  }

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

  containerEl.createEl('br');

  // ========================================
  // Navigation & tabs
  // ========================================
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

  // Hide tab list icon
  new Setting(containerEl)
    .setName('Hide tab list icon')
    .setDesc('Hides the tab list icon. You can still access tabs via other methods.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideTabListIcon)
      .onChange((value) => {
        plugin.settings.hideTabListIcon = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide new tab icon
  new Setting(containerEl)
    .setName('Hide new tab icon')
    .setDesc('Hides the new tab icon. You can still create new tabs with Ctrl+T (Cmd+T on Mac).')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideNewTabIcon)
      .onChange((value) => {
        plugin.settings.hideNewTabIcon = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide tab close button
  new Setting(containerEl)
    .setName('Hide tab close button')
    .setDesc('Hides the close button on tabs. You can still close tabs with middle click or other methods.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideTabCloseButton)
      .onChange((value) => {
        plugin.settings.hideTabCloseButton = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  containerEl.createEl('br');

  // ========================================
  // Status & UI elements
  // ========================================
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

  // Hide left sidebar toggle button
  new Setting(containerEl)
    .setName('Hide left sidebar toggle button')
    .setDesc('Hides the left sidebar toggle button.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideLeftSidebarButton)
      .onChange((value) => {
        plugin.settings.hideLeftSidebarButton = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide right sidebar toggle button
  new Setting(containerEl)
    .setName('Hide right sidebar toggle button')
    .setDesc('Hides the right sidebar toggle button.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideRightSidebarButton)
      .onChange((value) => {
        plugin.settings.hideRightSidebarButton = value;
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

  containerEl.createEl('br');

  // ========================================
  // Search
  // ========================================
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

  containerEl.createEl('br');

  // ========================================
  // Properties
  // ========================================
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

  // Deemphasize properties
  new Setting(containerEl)
    .setName('Deemphasize properties')
    .setDesc('Softens visual prominence of file properties. They become more visible on hover.')
    .addToggle(toggle => toggle.setValue(plugin.settings.deemphasizeProperties)
      .onChange((value) => {
        plugin.settings.deemphasizeProperties = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  containerEl.createEl('br');

  // ========================================
  // Other
  // ========================================
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

  containerEl.createEl('br');

  // ========================================
  // Desktop hide buttons
  // ========================================
  const desktopButtonsHeading = containerEl.createEl('div', {cls: 'setting-item setting-item-heading'});
  const desktopButtonsHeadingInfo = desktopButtonsHeading.createEl('div', {cls: 'setting-item-info'});
  desktopButtonsHeadingInfo.createEl('div', {text: 'Desktop hide buttons', cls: 'setting-item-name'});

  // Hide "New note" button
  new Setting(containerEl)
    .setName('Hide "New note" button')
    .setDesc('Hide "New note" button in navigation headers.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideButtonNewNote)
      .onChange((value) => {
        plugin.settings.hideButtonNewNote = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide "New folder" button
  new Setting(containerEl)
    .setName('Hide "New folder" button')
    .setDesc('Hide "New folder" button in navigation headers.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideButtonNewFolder)
      .onChange((value) => {
        plugin.settings.hideButtonNewFolder = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide "Sort order" button
  new Setting(containerEl)
    .setName('Hide "Sort order" button')
    .setDesc('Hide "Sort order" button in navigation headers.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideButtonSortOrder)
      .onChange((value) => {
        plugin.settings.hideButtonSortOrder = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide "Auto-reveal" button
  new Setting(containerEl)
    .setName('Hide "Auto-reveal" button')
    .setDesc('Hide "Auto-reveal" button in navigation headers.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideButtonAutoReveal)
      .onChange((value) => {
        plugin.settings.hideButtonAutoReveal = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide "Collapse all" button
  new Setting(containerEl)
    .setName('Hide "Collapse all" button')
    .setDesc('Hide "Collapse all" button in navigation headers.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideButtonCollapseAll)
      .onChange((value) => {
        plugin.settings.hideButtonCollapseAll = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide "Reading mode" button
  new Setting(containerEl)
    .setName('Hide "Reading mode" button')
    .setDesc('Hide "Reading mode" button in view headers.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideButtonReadingMode)
      .onChange((value) => {
        plugin.settings.hideButtonReadingMode = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide "Search settings" button
  new Setting(containerEl)
    .setName('Hide "Search settings" button')
    .setDesc('Hide "Search settings" button in search pane.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideButtonSearchSettings)
      .onChange((value) => {
        plugin.settings.hideButtonSearchSettings = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  containerEl.createEl('br');

  // ========================================
  // Mobile devices
  // ========================================
  const mobileHeading = containerEl.createEl('div', {cls: 'setting-item setting-item-heading'});
  const mobileHeadingInfo = mobileHeading.createEl('div', {cls: 'setting-item-info'});
  mobileHeadingInfo.createEl('div', {text: 'Mobile devices', cls: 'setting-item-name'});

  // ========================================
  // Mobile hide icons
  // ========================================
  const mobileIconsHeading = containerEl.createEl('div', {cls: 'setting-item setting-item-heading'});
  const mobileIconsHeadingInfo = mobileIconsHeading.createEl('div', {cls: 'setting-item-info'});
  mobileIconsHeadingInfo.createEl('div', {text: 'Hide icons', cls: 'setting-item-name'});

  // Hide "Mobile chevrons" icon
  new Setting(containerEl)
    .setName('Hide "Mobile chevrons" icon')
    .setDesc('Hide "Mobile chevrons" icon in mobile navbar.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideIconMobileChevrons)
      .onChange((value) => {
        plugin.settings.hideIconMobileChevrons = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  containerEl.createEl('br');

  // ========================================
  // Mobile hide buttons
  // ========================================
  const mobileButtonsHeading = containerEl.createEl('div', {cls: 'setting-item setting-item-heading'});
  const mobileButtonsHeadingInfo = mobileButtonsHeading.createEl('div', {cls: 'setting-item-info'});
  mobileButtonsHeadingInfo.createEl('div', {text: 'Hide buttons', cls: 'setting-item-name'});

  // Hide "Navigate back" button
  new Setting(containerEl)
    .setName('Hide "Navigate back" button')
    .setDesc('Hide "Navigate back" button in mobile navbar.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideButtonMobileNavbarActionBack)
      .onChange((value) => {
        plugin.settings.hideButtonMobileNavbarActionBack = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide "Navigate forward" button
  new Setting(containerEl)
    .setName('Hide "Navigate forward" button')
    .setDesc('Hide "Navigate forward" button in mobile navbar.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideButtonMobileNavbarActionForward)
      .onChange((value) => {
        plugin.settings.hideButtonMobileNavbarActionForward = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide "Quick switcher" button
  new Setting(containerEl)
    .setName('Hide "Quick switcher" button')
    .setDesc('Hide "Quick switcher" button in mobile navbar.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideButtonMobileNavbarActionQuickSwitcher)
      .onChange((value) => {
        plugin.settings.hideButtonMobileNavbarActionQuickSwitcher = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide "New tab" button
  new Setting(containerEl)
    .setName('Hide "New tab" button')
    .setDesc('Hide "New tab" button in mobile navbar.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideButtonMobileNavbarActionNewTab)
      .onChange((value) => {
        plugin.settings.hideButtonMobileNavbarActionNewTab = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide "Open tabs" button
  new Setting(containerEl)
    .setName('Hide "Open tabs" button')
    .setDesc('Hide "Open tabs" button in mobile navbar.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideButtonMobileNavbarActionTabs)
      .onChange((value) => {
        plugin.settings.hideButtonMobileNavbarActionTabs = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  // Hide "Ribbon menu" button
  new Setting(containerEl)
    .setName('Hide "Ribbon menu" button')
    .setDesc('Hide "Ribbon menu" button in mobile navbar.')
    .addToggle(toggle => toggle.setValue(plugin.settings.hideButtonMobileNavbarActionMenu)
      .onChange((value) => {
        plugin.settings.hideButtonMobileNavbarActionMenu = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  containerEl.createEl('br');

  // ========================================
  // Mobile swap button icon
  // ========================================
  // Swap mobile new tab icon
  new Setting(containerEl)
    .setName('Swap mobile new tab icon')
    .setDesc('Replace the new tab plus icon with a home button icon in mobile navbar.')
    .addToggle(toggle => toggle.setValue(plugin.settings.swapMobileNewTabIcon)
      .onChange((value) => {
        plugin.settings.swapMobileNewTabIcon = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      })
    );

  containerEl.createEl('br');

  // ========================================
  // Mobile navigation menu
  // ========================================
  const mobileNavMenuHeading = containerEl.createEl('div', {cls: 'setting-item setting-item-heading'});
  const mobileNavMenuHeadingInfo = mobileNavMenuHeading.createEl('div', {cls: 'setting-item-info'});
  mobileNavMenuHeadingInfo.createEl('div', {text: 'Mobile navigation menu', cls: 'setting-item-name'});

  // Order navbar button 1 (Navigate back)
  new Setting(containerEl)
    .setName('"Navigate back" button position')
    .setDesc('Select the position for the "Navigate back" button (default 1).')
    .addDropdown(dropdown => {
      for (let i = 1; i <= 6; i++) {
        dropdown.addOption(`order-navbar-button-nth-child-1-${i}`, String(i));
      }
      dropdown.setValue(plugin.settings.orderNavbarButton1);
      dropdown.onChange((value) => {
        plugin.settings.orderNavbarButton1 = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      });
    });

  // Order navbar button 2 (Navigate forward)
  new Setting(containerEl)
    .setName('"Navigate forward" button position')
    .setDesc('Select the position for the "Navigate forward" button (default 2).')
    .addDropdown(dropdown => {
      for (let i = 1; i <= 6; i++) {
        dropdown.addOption(`order-navbar-button-nth-child-2-${i}`, String(i));
      }
      dropdown.setValue(plugin.settings.orderNavbarButton2);
      dropdown.onChange((value) => {
        plugin.settings.orderNavbarButton2 = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      });
    });

  // Order navbar button 3 (Quick switcher)
  new Setting(containerEl)
    .setName('"Quick switcher" button position')
    .setDesc('Select the position for the "Quick switcher" button (default 3).')
    .addDropdown(dropdown => {
      for (let i = 1; i <= 6; i++) {
        dropdown.addOption(`order-navbar-button-nth-child-3-${i}`, String(i));
      }
      dropdown.setValue(plugin.settings.orderNavbarButton3);
      dropdown.onChange((value) => {
        plugin.settings.orderNavbarButton3 = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      });
    });

  // Order navbar button 4 (New tab)
  new Setting(containerEl)
    .setName('"New tab" button position')
    .setDesc('Select the position for the "New tab" button (default 4).')
    .addDropdown(dropdown => {
      for (let i = 1; i <= 6; i++) {
        dropdown.addOption(`order-navbar-button-nth-child-4-${i}`, String(i));
      }
      dropdown.setValue(plugin.settings.orderNavbarButton4);
      dropdown.onChange((value) => {
        plugin.settings.orderNavbarButton4 = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      });
    });

  // Order navbar button 5 (Open tabs)
  new Setting(containerEl)
    .setName('"Open tabs" button position')
    .setDesc('Select the position for the "Open tabs" button (default 5).')
    .addDropdown(dropdown => {
      for (let i = 1; i <= 6; i++) {
        dropdown.addOption(`order-navbar-button-nth-child-5-${i}`, String(i));
      }
      dropdown.setValue(plugin.settings.orderNavbarButton5);
      dropdown.onChange((value) => {
        plugin.settings.orderNavbarButton5 = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      });
    });

  // Order navbar button 6 (Ribbon menu)
  new Setting(containerEl)
    .setName('"Ribbon menu" button position')
    .setDesc('Select the position for the "Ribbon menu" button (default 6).')
    .addDropdown(dropdown => {
      for (let i = 1; i <= 6; i++) {
        dropdown.addOption(`order-navbar-button-nth-child-6-${i}`, String(i));
      }
      dropdown.setValue(plugin.settings.orderNavbarButton6);
      dropdown.onChange((value) => {
        plugin.settings.orderNavbarButton6 = value;
        void plugin.saveData(plugin.settings);
        plugin.refresh();
      });
    });
}
