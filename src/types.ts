/**
 * Shared type definitions across the plugin
 */

import { App, Workspace } from 'obsidian';
import MinimalTheme from './main';

// Extend Obsidian's App type with private APIs we use
export interface ObsidianApp extends App {
  vault: {
    getConfig(key: string): unknown;
    setConfig(key: string, value: unknown): void;
  } & App['vault'];
  workspace: Workspace;
  setTheme(theme: string): void;
  updateFontSize(): void;
}

// Type guard for ObsidianApp
export function isObsidianApp(app: App): app is ObsidianApp {
  return 'setTheme' in app && 'updateFontSize' in app;
}

// Plugin reference type for commands and managers
export type PluginContext = MinimalTheme;

// Command callback type
export type CommandCallback = () => void;

// Settings change handler type
export type SettingsChangeHandler = () => void;

// CSS class list types
export type LightStyle = 'minimal-light' | 'minimal-light-tonal' | 'minimal-light-contrast' | 'minimal-light-white';
export type DarkStyle = 'minimal-dark' | 'minimal-dark-tonal' | 'minimal-dark-black';
export type ThemeMode = 'light' | 'dark';

// Width style types
export type TableWidth = 'table-100' | 'table-default-width' | 'table-wide' | 'table-max';
export type IframeWidth = 'iframe-100' | 'iframe-default-width' | 'iframe-wide' | 'iframe-max';
export type ImageWidth = 'img-100' | 'img-default-width' | 'img-wide' | 'img-max';
export type MapWidth = 'map-100' | 'map-default-width' | 'map-wide' | 'map-max';
export type ChartWidth = 'chart-100' | 'chart-default-width' | 'chart-wide' | 'chart-max';

// Style manager interface
export interface StyleManager {
  updateStyle(): void;
  updateLightStyle(): void;
  updateDarkStyle(): void;
  updateLightScheme(): void;
  updateDarkScheme(): void;
  updateCustomPresetCSS(): void;
  removeStyle(): void;
  removeLightScheme(): void;
  removeDarkScheme(): void;
  removeSettings(): void;
  refresh(): void;
}

// Theme manager interface
export interface ThemeManager {
  updateTheme(): void;
  switchToLight(): void;
  switchToDark(): void;
  getCurrentMode(): ThemeMode;
}

// Settings sync manager interface
export interface SettingsSyncManager {
  syncFromVault(): void;
  syncToVault(): void;
  setupWatchers(): void;
  cleanup(): void;
}

// CSS manager helpers
export interface CSSManager {
  injectStyleElement(id: string, css: string): void;
  removeStyleElement(id: string): void;
  updateStyleElement(id: string, css: string): void;
}

// Mutation observer wrapper for safe cleanup
export interface SafeMutationObserver {
  observer: MutationObserver;
  cleanup(): void;
}

