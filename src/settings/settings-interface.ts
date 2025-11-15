/**
 * Settings interface and defaults
 */

import { CustomColorPreset } from '../presets/CustomPreset';

export interface MinimalSettings {
  lightStyle: string;
  darkStyle: string;
  lightScheme: string;
  darkScheme: string;
  editorFont: string;
  colorfulHeadings: boolean;
  colorfulFrame: boolean;
  colorfulActiveStates: boolean;
  trimNames: boolean;
  labeledNav: boolean;
  workspaceBorders: string;  // 'enhanced' | 'default' | 'none'
  focusMode: boolean;
  lineHeight: number;
  lineWidth: number;
  lineWidthWide: number;
  maxWidth: number;
  imgGrid: boolean;
  devBlockWidth: boolean;
  tableWidth: string;
  iframeWidth: string;
  imgWidth: string;
  chartWidth: string;
  mapWidth: string;
  fullWidthMedia: boolean;
  hideTitleBarOnHover: boolean;
  minimalStatus: boolean;
  textNormal: number;
  textSmall: number;
  underlineInternal: boolean;
  underlineExternal: boolean;
  folding: boolean;
  lineNumbers: boolean;
  readableLineLength: boolean;
  customPresets: CustomColorPreset[];
  enableCustomPresets: boolean;
  // Sidebar indentation guides
  navIndentationGuideWidth: string;  // '0px' | '1px' | '2px' | '3px'
  navIndentationGuideColor: string;   // 'var(--ui1)' | 'var(--text-faint)' | 'var(--text-accent)'
  // Hider settings
  hideTabs: boolean;
  hideStatus: boolean;
  hideScroll: boolean;
  hideSidebarButtons: boolean;
  hideTooltips: boolean;
  hideFileNavButtons: boolean;
  hideSearchSuggestions: boolean;
  hideSearchCounts: boolean;
  hideInstructions: boolean;
  hidePropertiesReading: boolean;
  hideVault: boolean;
  hidePropertiesHeading: boolean;
  hideAddPropertyButton: boolean;
  autoHideVaultSwitcher: boolean;
  hideHelpButton: boolean;
  collapseFileExplorerButtons: boolean;
}

export const DEFAULT_SETTINGS: MinimalSettings = {
  lightStyle: 'minimal-light',
  darkStyle: 'minimal-dark',
  lightScheme: 'minimal-oxygen-light',
  darkScheme: 'minimal-oxygen-dark',
  editorFont: '',
  lineHeight: 1.5,
  lineWidth: 40,
  lineWidthWide: 50,
  maxWidth: 88,
  textNormal: 16,
  textSmall: 13,
  imgGrid: false,
  imgWidth: 'img-default-width',
  tableWidth: 'table-default-width',
  iframeWidth: 'iframe-default-width',
  mapWidth: 'map-default-width',
  chartWidth: 'chart-default-width',
  colorfulHeadings: false,
  colorfulFrame: false,
  colorfulActiveStates: false,
  trimNames: true,
  labeledNav: false,
  fullWidthMedia: true,
  hideTitleBarOnHover: true,
  workspaceBorders: 'enhanced',
  minimalStatus: true,
  focusMode: false,
  underlineInternal: true,
  underlineExternal: true,
  folding: true,
  lineNumbers: false,
  readableLineLength: false,
  devBlockWidth: false,
  customPresets: [],
  enableCustomPresets: true,
  // Sidebar indentation guides
  navIndentationGuideWidth: '0px',
  navIndentationGuideColor: 'rgba(var(--mono-rgb-100), 0.12)',
  // Hider settings
  hideTabs: false,
  hideStatus: false,
  hideScroll: false,
  hideSidebarButtons: false,
  hideTooltips: false,
  hideFileNavButtons: false,
  hideSearchSuggestions: false,
  hideSearchCounts: false,
  hideInstructions: false,
  hidePropertiesReading: false,
  hideVault: false,
  hidePropertiesHeading: false,
  hideAddPropertyButton: false,
  autoHideVaultSwitcher: false,
  hideHelpButton: false,
  collapseFileExplorerButtons: false,
};

