import { App } from 'obsidian';
import { getVaultConfig } from '../types/obsidian-extensions';
import { OXYGEN_THEME_NAME } from '../constants';

/**
 * Checks if the Oxygen theme is currently active in the vault.
 * @param app The Obsidian App instance.
 * @returns true if Oxygen theme is active, false otherwise.
 */
export function isOxygenThemeActive(app: App): boolean {
    const cssTheme = getVaultConfig(app, 'cssTheme');
    return cssTheme === OXYGEN_THEME_NAME;
}
