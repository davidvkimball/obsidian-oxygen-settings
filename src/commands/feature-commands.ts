/**
 * Feature toggle commands (borders, headings, focus mode, etc.)
 */

import { PluginContext } from '../types';
import { COMMAND_IDS } from '../constants';
import { getVaultConfig, setTheme, setVaultConfig } from '../types/obsidian-extensions';

export function registerFeatureCommands(plugin: PluginContext): void {
  plugin.addCommand({
    id: COMMAND_IDS.TOGGLE_BORDERS,
    name: 'Toggle sidebar borders',
    callback: () => {
      // Cycle through: enhanced -> default -> none -> enhanced
      const current = plugin.settings.workspaceBorders;
      if (current === 'enhanced') {
        plugin.settings.workspaceBorders = 'default';
      } else if (current === 'default') {
        plugin.settings.workspaceBorders = 'none';
      } else {
        plugin.settings.workspaceBorders = 'enhanced';
      }
      void plugin.saveData(plugin.settings);
      refresh(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.TOGGLE_COLORFUL_HEADINGS,
    name: 'Toggle colorful headings',
    callback: () => {
      plugin.settings.colorfulHeadings = !plugin.settings.colorfulHeadings;
      void plugin.saveData(plugin.settings);
      refresh(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.TOGGLE_FOCUS_MODE,
    name: 'Toggle focus mode',
    callback: () => {
      plugin.settings.focusMode = !plugin.settings.focusMode;
      void plugin.saveData(plugin.settings);
      refresh(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.TOGGLE_ZEN_MODE,
    name: 'Toggle Zen mode',
    callback: async () => {
      const enteringZenMode = !plugin.settings.zenMode;
      const app = plugin.app;
      
      // Store sidebar state before entering zen mode
      if (enteringZenMode && app.workspace.leftSplit && app.workspace.rightSplit) {
        plugin.settings.zenModeLeftSidebar = app.workspace.leftSplit.collapsed;
        plugin.settings.zenModeRightSidebar = app.workspace.rightSplit.collapsed;
      }
      
      if (plugin.settings.zenModeFullscreen) {
        // Fullscreen mode
        if (enteringZenMode) {
          // Enter fullscreen first, then update zen mode
          if (document.documentElement.requestFullscreen) {
            try {
              await document.documentElement.requestFullscreen();
              // Wait for next frame to ensure fullscreen transition is smooth
              await new Promise((resolve) =>
                requestAnimationFrame(resolve)
              );
            } catch (e) {
              // Fullscreen might fail (e.g., user cancelled), continue anyway
            }
          }
          // Now update zen mode after fullscreen is active
          plugin.settings.zenMode = true;
          void plugin.saveData(plugin.settings);
          refresh(plugin);
        } else {
          // Exit zen mode first
          plugin.settings.zenMode = false;
          void plugin.saveData(plugin.settings);
          refresh(plugin);
          // Wait for DOM updates to complete
          await new Promise((resolve) => requestAnimationFrame(resolve));
          // Then exit fullscreen
          if (document.fullscreenElement) {
            try {
              await document.exitFullscreen();
            } catch (e) {
              // Ignore errors
            }
          }
        }
      } else {
        // Regular mode (no fullscreen)
        plugin.settings.zenMode = !plugin.settings.zenMode;
        void plugin.saveData(plugin.settings);
        refresh(plugin);
      }
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.TOGGLE_COLORFUL_FRAME,
    name: 'Toggle colorful window frame',
    callback: () => {
      plugin.settings.colorfulFrame = !plugin.settings.colorfulFrame;
      void plugin.saveData(plugin.settings);
      refresh(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.TOGGLE_IMAGE_GRID,
    name: 'Toggle image grids',
    callback: () => {
      plugin.settings.imgGrid = !plugin.settings.imgGrid;
      void plugin.saveData(plugin.settings);
      refresh(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.TOGGLE_THEME,
    name: 'Switch between light and dark mode',
    callback: () => {
      updateTheme(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.DEV_BLOCK_WIDTH,
    name: 'Dev — show block widths',
    callback: () => {
      plugin.settings.devBlockWidth = !plugin.settings.devBlockWidth;
      void plugin.saveData(plugin.settings);
      refresh(plugin);
    }
  });
}

function refresh(plugin: PluginContext): void {
  plugin.updateStyle();
}

function updateTheme(plugin: PluginContext): void {
  // Only apply styles if Oxygen theme is active
  if (!plugin.isOxygenThemeActive()) {
    return;
  }
  
  const theme = getVaultConfig(plugin.app, 'theme');
  
  if (theme === 'system') {
    if (document.body.classList.contains('theme-light')) {
      document.body.removeClass('theme-light');
      document.body.addClass('theme-dark');
    } else {
      document.body.removeClass('theme-dark');
      document.body.addClass('theme-light');
    }
  } else {
    if (document.body.classList.contains('theme-light')) {
      document.body.removeClass('theme-light');
      document.body.addClass('theme-dark');
    } else {
      document.body.removeClass('theme-dark');
      document.body.addClass('theme-light');
    }

    const currentTheme = getVaultConfig(plugin.app, 'theme');
    const newTheme = currentTheme === 'moonstone' ? 'obsidian' : 'moonstone';
    setTheme(plugin.app, newTheme);
    setVaultConfig(plugin.app, 'theme', newTheme);
  }
  plugin.app.workspace.trigger('css-change');
}

