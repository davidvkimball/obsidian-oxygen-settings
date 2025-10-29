/**
 * Central constants for the Oxygen Settings plugin
 * Eliminates magic strings and provides single source of truth
 */

// Plugin identification
export const PLUGIN_ID = 'oxygen-settings';
export const PLUGIN_NAME = 'Oxygen Theme Settings';

// CSS class names
export const CSS_CLASSES = {
  PLUGIN_THEME: 'minimal-theme',
  THEME_LIGHT: 'theme-light',
  THEME_DARK: 'theme-dark',
  CUSTOM_PRESETS_STYLE: 'minimal-custom-presets',
  THEME_OVERRIDE: 'data-theme-override',
} as const;

// Light mode styles
export const LIGHT_STYLES = [
  'minimal-light',
  'minimal-light-tonal',
  'minimal-light-contrast',
  'minimal-light-white'
] as const;

// Dark mode styles
export const DARK_STYLES = [
  'minimal-dark',
  'minimal-dark-tonal',
  'minimal-dark-black'
] as const;

// Light color schemes (built-in)
export const LIGHT_SCHEMES = [
  'minimal-oxygen-light',
  'minimal-minimal-light',
  'minimal-atom-light',
  'minimal-ayu-light',
  'minimal-catppuccin-light',
  'minimal-eink-light',
  'minimal-everforest-light',
  'minimal-flexoki-light',
  'minimal-gruvbox-light',
  'minimal-macos-light',
  'minimal-nord-light',
  'minimal-rose-pine-light',
  'minimal-notion-light',
  'minimal-solarized-light',
  'minimal-things-light'
] as const;

// Dark color schemes (built-in)
export const DARK_SCHEMES = [
  'minimal-oxygen-dark',
  'minimal-minimal-dark',
  'minimal-atom-dark',
  'minimal-ayu-dark',
  'minimal-catppuccin-dark',
  'minimal-dracula-dark',
  'minimal-eink-dark',
  'minimal-everforest-dark',
  'minimal-flexoki-dark',
  'minimal-gruvbox-dark',
  'minimal-macos-dark',
  'minimal-nord-dark',
  'minimal-rose-pine-dark',
  'minimal-notion-dark',
  'minimal-solarized-dark',
  'minimal-things-dark'
] as const;

// Image grid styles
export const IMAGE_GRID_STYLES = [
  'img-grid',
  'img-grid-ratio',
  'img-nogrid'
] as const;

// Width style options
export const TABLE_WIDTH_STYLES = [
  'table-100',
  'table-default-width',
  'table-wide',
  'table-max'
] as const;

export const IFRAME_WIDTH_STYLES = [
  'iframe-100',
  'iframe-default-width',
  'iframe-wide',
  'iframe-max'
] as const;

export const IMAGE_WIDTH_STYLES = [
  'img-100',
  'img-default-width',
  'img-wide',
  'img-max'
] as const;

export const MAP_WIDTH_STYLES = [
  'map-100',
  'map-default-width',
  'map-wide',
  'map-max'
] as const;

export const CHART_WIDTH_STYLES = [
  'chart-100',
  'chart-default-width',
  'chart-wide',
  'chart-max'
] as const;

// Command IDs
export const COMMAND_IDS = {
  // Font commands
  INCREASE_FONT: 'increase-body-font-size',
  DECREASE_FONT: 'decrease-body-font-size',
  
  // Style cycling commands
  CYCLE_DARK_STYLE: 'toggle-minimal-dark-cycle',
  CYCLE_LIGHT_STYLE: 'toggle-minimal-light-cycle',
  
  // Feature toggle commands
  TOGGLE_BORDERS: 'toggle-hidden-borders',
  TOGGLE_COLORFUL_HEADINGS: 'toggle-colorful-headings',
  TOGGLE_FOCUS_MODE: 'toggle-minimal-focus-mode',
  TOGGLE_COLORFUL_FRAME: 'toggle-minimal-colorful-frame',
  TOGGLE_IMAGE_GRID: 'toggle-minimal-img-grid',
  TOGGLE_THEME: 'toggle-minimal-switch',
  
  // Width cycling commands
  CYCLE_TABLE_WIDTH: 'cycle-minimal-table-width',
  CYCLE_IMAGE_WIDTH: 'cycle-minimal-image-width',
  CYCLE_IFRAME_WIDTH: 'cycle-minimal-iframe-width',
  CYCLE_CHART_WIDTH: 'cycle-minimal-chart-width',
  CYCLE_MAP_WIDTH: 'cycle-minimal-map-width',
  
  // Light style commands
  LIGHT_DEFAULT: 'toggle-minimal-light-default',
  LIGHT_WHITE: 'toggle-minimal-light-white',
  LIGHT_TONAL: 'toggle-minimal-light-tonal',
  LIGHT_CONTRAST: 'toggle-minimal-light-contrast',
  
  // Dark style commands
  DARK_DEFAULT: 'toggle-minimal-dark-default',
  DARK_TONAL: 'toggle-minimal-dark-tonal',
  DARK_BLACK: 'toggle-minimal-dark-black',
  
  // Custom preset commands
  CREATE_PRESET: 'create-custom-preset',
  IMPORT_PRESET: 'import-custom-preset',
  CYCLE_PRESETS_LIGHT: 'cycle-custom-presets-light',
  CYCLE_PRESETS_DARK: 'cycle-custom-presets-dark',
  
  // Dev commands
  DEV_BLOCK_WIDTH: 'toggle-minimal-dev-block-width',
} as const;

// Scheme command ID prefixes
export const SCHEME_COMMAND_PREFIX = {
  LIGHT: 'toggle-minimal-',
  DARK: 'toggle-minimal-',
} as const;

// Default values
export const DEFAULTS = {
  FONT_SIZE_NORMAL: 16,
  FONT_SIZE_SMALL: 13,
  LINE_HEIGHT: 1.5,
  LINE_WIDTH: 40,
  LINE_WIDTH_WIDE: 50,
  MAX_WIDTH: 88,
  FONT_STEP: 0.5,
} as const;

// Obsidian vault config keys
export const VAULT_CONFIG = {
  BASE_FONT_SIZE: 'baseFontSize',
  FOLD_HEADING: 'foldHeading',
  SHOW_LINE_NUMBER: 'showLineNumber',
  READABLE_LINE_LENGTH: 'readableLineLength',
  THEME: 'theme',
} as const;

// Obsidian theme names
export const OBSIDIAN_THEMES = {
  LIGHT: 'moonstone',
  DARK: 'obsidian',
  SYSTEM: 'system',
} as const;

// Custom preset prefix
export const CUSTOM_PRESET_PREFIX = 'minimal-custom-';

// CSS update delay (ms)
export const CSS_UPDATE_DELAY = 50;
export const CSS_REFLOW_DELAY = 100;

// Scheme display names for dropdowns
export const SCHEME_DISPLAY_NAMES: Record<string, string> = {
  // Light schemes
  'minimal-oxygen-light': 'Oxygen',
  'minimal-minimal-light': 'Minimal',
  'minimal-atom-light': 'Atom',
  'minimal-ayu-light': 'Ayu',
  'minimal-catppuccin-light': 'Catppuccin',
  'minimal-eink-light': 'E-ink (beta)',
  'minimal-everforest-light': 'Everforest',
  'minimal-flexoki-light': 'Flexoki',
  'minimal-gruvbox-light': 'Gruvbox',
  'minimal-macos-light': 'macOS',
  'minimal-nord-light': 'Nord',
  'minimal-rose-pine-light': 'Rosé Pine',
  'minimal-notion-light': 'Sky',
  'minimal-solarized-light': 'Solarized',
  'minimal-things-light': 'Things',
  // Dark schemes
  'minimal-oxygen-dark': 'Oxygen',
  'minimal-minimal-dark': 'Minimal',
  'minimal-atom-dark': 'Atom',
  'minimal-ayu-dark': 'Ayu',
  'minimal-catppuccin-dark': 'Catppuccin',
  'minimal-dracula-dark': 'Dracula',
  'minimal-eink-dark': 'E-ink (beta)',
  'minimal-everforest-dark': 'Everforest',
  'minimal-flexoki-dark': 'Flexoki',
  'minimal-gruvbox-dark': 'Gruvbox',
  'minimal-macos-dark': 'macOS',
  'minimal-nord-dark': 'Nord',
  'minimal-rose-pine-dark': 'Rosé Pine',
  'minimal-notion-dark': 'Sky',
  'minimal-solarized-dark': 'Solarized',
  'minimal-things-dark': 'Things',
} as const;

