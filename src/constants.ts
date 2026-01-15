/**
 * Central constants for the Oxygen Settings plugin
 * Eliminates magic strings and provides single source of truth
 */

// Plugin identification
export const PLUGIN_ID = 'oxygen-settings';
export const PLUGIN_NAME = 'Oxygen Theme Settings';

// CSS class names
export const CSS_CLASSES = {
  PLUGIN_THEME: 'oxygen-theme',
  THEME_LIGHT: 'theme-light',
  THEME_DARK: 'theme-dark',
  CUSTOM_PRESETS_STYLE: 'oxygen-custom-presets',
  THEME_OVERRIDE: 'data-theme-override',
} as const;

// Light mode styles
export const LIGHT_STYLES = [
  'oxygen-light',
  'oxygen-light-tonal',
  'oxygen-light-contrast',
  'oxygen-light-white'
] as const;

// Dark mode styles
export const DARK_STYLES = [
  'oxygen-dark',
  'oxygen-dark-tonal',
  'oxygen-dark-black'
] as const;

// Light color schemes (built-in)
export const LIGHT_SCHEMES = [
  'oxygen-oxygen-light',
  'oxygen-minimal-light',
  'oxygen-atom-light',
  'oxygen-ayu-light',
  'oxygen-catppuccin-light',
  'oxygen-eink-light',
  'oxygen-everforest-light',
  'oxygen-flexoki-light',
  'oxygen-gruvbox-light',
  'oxygen-macos-light',
  'oxygen-nord-light',
  'oxygen-rose-pine-light',
  'oxygen-notion-light',
  'oxygen-solarized-light',
  'oxygen-things-light'
] as const;

// Dark color schemes (built-in)
export const DARK_SCHEMES = [
  'oxygen-oxygen-dark',
  'oxygen-minimal-dark',
  'oxygen-atom-dark',
  'oxygen-ayu-dark',
  'oxygen-catppuccin-dark',
  'oxygen-dracula-dark',
  'oxygen-eink-dark',
  'oxygen-everforest-dark',
  'oxygen-flexoki-dark',
  'oxygen-gruvbox-dark',
  'oxygen-macos-dark',
  'oxygen-nord-dark',
  'oxygen-rose-pine-dark',
  'oxygen-notion-dark',
  'oxygen-solarized-dark',
  'oxygen-things-dark'
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
  
  // Settings command
  OPEN_SETTINGS: 'oxygen-settings:open-settings',
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

// Oxygen theme name for detection
export const OXYGEN_THEME_NAME = 'Oxygen';

// Custom preset prefix
export const CUSTOM_PRESET_PREFIX = 'oxygen-custom-';


// Scheme display names for dropdowns
export const SCHEME_DISPLAY_NAMES: Record<string, string> = {
  // Light schemes
  'oxygen-oxygen-light': 'Oxygen',
  'oxygen-minimal-light': 'Minimal',
  'oxygen-atom-light': 'Atom',
  'oxygen-ayu-light': 'Ayu',
  'oxygen-catppuccin-light': 'Catppuccin',
  'oxygen-eink-light': 'E-ink (beta)',
  'oxygen-everforest-light': 'Everforest',
  'oxygen-flexoki-light': 'Flexoki',
  'oxygen-gruvbox-light': 'Gruvbox',
  'oxygen-macos-light': 'macOS',
  'oxygen-nord-light': 'Nord',
  'oxygen-rose-pine-light': 'Rosé Pine',
  'oxygen-notion-light': 'Sky',
  'oxygen-solarized-light': 'Solarized',
  'oxygen-things-light': 'Things',
  // Dark schemes
  'oxygen-oxygen-dark': 'Oxygen',
  'oxygen-minimal-dark': 'Minimal',
  'oxygen-atom-dark': 'Atom',
  'oxygen-ayu-dark': 'Ayu',
  'oxygen-catppuccin-dark': 'Catppuccin',
  'oxygen-dracula-dark': 'Dracula',
  'oxygen-eink-dark': 'E-ink (beta)',
  'oxygen-everforest-dark': 'Everforest',
  'oxygen-flexoki-dark': 'Flexoki',
  'oxygen-gruvbox-dark': 'Gruvbox',
  'oxygen-macos-dark': 'macOS',
  'oxygen-nord-dark': 'Nord',
  'oxygen-rose-pine-dark': 'Rosé Pine',
  'oxygen-notion-dark': 'Sky',
  'oxygen-solarized-dark': 'Solarized',
  'oxygen-things-dark': 'Things',
} as const;

