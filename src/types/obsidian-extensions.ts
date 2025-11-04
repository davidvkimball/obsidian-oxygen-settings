/**
 * Type extensions for Obsidian internal APIs
 * These are not part of the public API but are commonly used
 */

import { App } from 'obsidian';

/**
 * Extended App interface with internal vault methods
 * Uses intersection type to add methods without conflicting with existing Vault type
 */
export interface ExtendedApp extends Omit<App, 'vault' | 'setTheme' | 'updateFontSize'> {
  vault: App['vault'] & {
    getConfig(key: string): unknown;
    setConfig(key: string, value: unknown): void;
    on(event: 'config-changed', callback: () => void): { off: () => void };
  };
  setTheme(theme: string): void;
  updateFontSize(): void;
}

/**
 * Type guard to check if app has extended methods
 */
export function hasExtendedApp(app: App): app is ExtendedApp {
  const extApp = app as unknown as ExtendedApp;
  return (
    typeof extApp.vault?.getConfig === 'function' &&
    typeof extApp.setTheme === 'function'
  );
}

/**
 * Safely access vault config
 */
export function getVaultConfig(app: App, key: string): unknown {
  const extApp = app as unknown as ExtendedApp;
  return extApp.vault.getConfig(key);
}

/**
 * Safely set vault config
 */
export function setVaultConfig(app: App, key: string, value: unknown): void {
  const extApp = app as unknown as ExtendedApp;
  extApp.vault.setConfig(key, value);
}

/**
 * Safely set theme
 */
export function setTheme(app: App, theme: string): void {
  const extApp = app as unknown as ExtendedApp;
  extApp.setTheme(theme);
}

/**
 * Safely register vault event listener
 */
export function onVaultConfigChanged(app: App, callback: () => void): { off: () => void } {
  const extApp = app as unknown as ExtendedApp;
  return extApp.vault.on('config-changed', callback);
}

/**
 * Safely update font size
 */
export function updateFontSize(app: App): void {
  const extApp = app as unknown as ExtendedApp;
  if (typeof extApp.updateFontSize === 'function') {
    extApp.updateFontSize();
  }
}

