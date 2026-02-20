import { App } from 'obsidian';
import { getVaultConfig, setVaultConfig } from '../types/obsidian-extensions';
import { OXYGEN_THEME_NAME } from '../constants';
import { HSLColor } from '../presets/CustomPreset';
import { hslToHex } from './color-utils';

/**
 * Checks if the Oxygen theme is currently active in the vault.
 * @param app The Obsidian App instance.
 * @returns true if Oxygen theme is active, false otherwise.
 */
export function isOxygenThemeActive(app: App): boolean {
    const cssTheme = getVaultConfig(app, 'cssTheme');
    return cssTheme === OXYGEN_THEME_NAME;
}

/**
 * Updates Obsidian's native accent color setting.
 * @param app The Obsidian App instance.
 * @param hsl The HSL color to set as the accent color.
 */
export function updateObsidianAccentColor(app: App, hsl: HSLColor): void {
    const hex = hslToHex(hsl);
    setVaultConfig(app, 'accentColor', hex);
    app.workspace.trigger('css-change');
}
