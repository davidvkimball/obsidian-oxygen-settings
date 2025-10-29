/**
 * Central command registration
 * Imports and registers all command modules
 */

import { PluginContext } from '../types';
import { registerFontCommands } from './font-commands';
import { registerStyleCommands } from './style-commands';
import { registerSchemeCommands } from './scheme-commands';
import { registerPresetCommands } from './preset-commands';
import { registerFeatureCommands } from './feature-commands';
import { registerWidthCommands } from './width-commands';

/**
 * Register all plugin commands
 * Call this from the plugin's onload() method
 */
export function registerAllCommands(plugin: PluginContext): void {
  registerFontCommands(plugin);
  registerStyleCommands(plugin);
  registerSchemeCommands(plugin);
  registerPresetCommands(plugin);
  registerFeatureCommands(plugin);
  registerWidthCommands(plugin);
}

