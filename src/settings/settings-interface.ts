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
  hideSidebarButtons: boolean; // Deprecated: use hideLeftSidebarButton and hideRightSidebarButton instead
  hideLeftSidebarButton: boolean;
  hideRightSidebarButton: boolean;
  hideTooltips: boolean;
  hideFileNavButtons: boolean;
  hideSearchSuggestions: boolean;
  hideSearchCounts: boolean;
  hideInstructions: boolean;
  hidePropertiesReading: boolean;
  hideVault: boolean;
  hidePropertiesHeading: boolean;
  hideAddPropertyButton: boolean;
  deemphasizeProperties: boolean;
  autoHideVaultSwitcher: boolean;
  autoHideVaultSwitcherBgTransparency: number; // 0-1, default 0
  hideHelpButton: boolean;
  autoHideSettingsButton: boolean;
  collapseFileExplorerButtons: boolean; // Deprecated: use autoHideFileExplorerNavHeader and collapseOtherNavHeaders instead
  autoHideFileExplorerNavHeader: boolean;
  autoHideOtherNavHeaders: boolean;
  autoHideLeftTabHeaders: boolean;
  autoHideRightTabHeaders: boolean;
  collapseOtherNavHeaders: boolean;
  autoCollapseRibbon: boolean;
  autoHideTabBarWhenSingleTab: boolean;
  // Desktop hide buttons
  hideButtonNewNote: boolean;
  hideButtonNewFolder: boolean;
  hideButtonSortOrder: boolean;
  hideButtonAutoReveal: boolean;
  hideButtonCollapseAll: boolean;
  hideButtonReadingMode: boolean;
  hideButtonSearchSettings: boolean;
  // Tab icons
  hideTabListIcon: boolean;
  hideNewTabIcon: boolean;
  hideTabCloseButton: boolean;
  // Mobile hide icons
  hideIconMobileChevrons: boolean;
  // Mobile hide buttons
  hideButtonMobileNavbarActionBack: boolean;
  hideButtonMobileNavbarActionForward: boolean;
  hideButtonMobileNavbarActionQuickSwitcher: boolean;
  hideButtonMobileNavbarActionNewTab: boolean;
  hideButtonMobileNavbarActionTabs: boolean;
  hideButtonMobileNavbarActionMenu: boolean;
  // Mobile swap button icon
  swapMobileNewTabIcon: boolean;
  // Mobile navigation menu ordering
  orderNavbarButton1: string; // 'order-navbar-button-nth-child-1-1' to 'order-navbar-button-nth-child-1-6'
  orderNavbarButton2: string; // 'order-navbar-button-nth-child-2-1' to 'order-navbar-button-nth-child-2-6'
  orderNavbarButton3: string; // 'order-navbar-button-nth-child-3-1' to 'order-navbar-button-nth-child-3-6'
  orderNavbarButton4: string; // 'order-navbar-button-nth-child-4-1' to 'order-navbar-button-nth-child-4-6'
  orderNavbarButton5: string; // 'order-navbar-button-nth-child-5-1' to 'order-navbar-button-nth-child-5-6'
  orderNavbarButton6: string; // 'order-navbar-button-nth-child-6-1' to 'order-navbar-button-nth-child-6-6'
  // Animation settings
  animationPersonality: 'default' | 'playful' | 'off';
  animationSpeed: number; // 0-2, default 1
  // Help button replacement
  helpButtonReplacement?: HelpButtonReplacementSettings;
}

export interface HelpButtonReplacementSettings {
  enabled: boolean;
  commandId: string;
  iconId: string;
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
  hideSidebarButtons: false, // Deprecated: kept for backward compatibility
  hideLeftSidebarButton: false,
  hideRightSidebarButton: false,
  hideTooltips: false,
  hideFileNavButtons: false,
  hideSearchSuggestions: false,
  hideSearchCounts: false,
  hideInstructions: false,
  hidePropertiesReading: false,
  hideVault: false,
  hidePropertiesHeading: false,
  hideAddPropertyButton: false,
  deemphasizeProperties: false,
  autoHideVaultSwitcher: false,
  autoHideVaultSwitcherBgTransparency: 0.9,
  hideHelpButton: false,
  autoHideSettingsButton: false,
  collapseFileExplorerButtons: false,
  autoHideFileExplorerNavHeader: false,
  autoHideOtherNavHeaders: false,
  autoHideLeftTabHeaders: false,
  autoHideRightTabHeaders: false,
  collapseOtherNavHeaders: false,
  autoCollapseRibbon: false,
  autoHideTabBarWhenSingleTab: false,
  // Desktop hide buttons
  hideButtonNewNote: false,
  hideButtonNewFolder: false,
  hideButtonSortOrder: false,
  hideButtonAutoReveal: false,
  hideButtonCollapseAll: false,
  hideButtonReadingMode: false,
  hideButtonSearchSettings: false,
  // Tab icons
  hideTabListIcon: false,
  hideNewTabIcon: false,
  hideTabCloseButton: false,
  // Mobile hide icons
  hideIconMobileChevrons: false,
  // Mobile hide buttons
  hideButtonMobileNavbarActionBack: false,
  hideButtonMobileNavbarActionForward: false,
  hideButtonMobileNavbarActionQuickSwitcher: false,
  hideButtonMobileNavbarActionNewTab: false,
  hideButtonMobileNavbarActionTabs: false,
  hideButtonMobileNavbarActionMenu: false,
  // Mobile swap button icon
  swapMobileNewTabIcon: false,
  // Mobile navigation menu ordering
  orderNavbarButton1: 'order-navbar-button-nth-child-1-1',
  orderNavbarButton2: 'order-navbar-button-nth-child-2-2',
  orderNavbarButton3: 'order-navbar-button-nth-child-3-3',
  orderNavbarButton4: 'order-navbar-button-nth-child-4-4',
  orderNavbarButton5: 'order-navbar-button-nth-child-5-5',
  orderNavbarButton6: 'order-navbar-button-nth-child-6-6',
  // Animation settings
  animationPersonality: 'default',
  animationSpeed: 1,
  // Help button replacement
  helpButtonReplacement: {
    enabled: false,
    commandId: 'oxygen-settings:open-settings',
    iconId: 'settings-2',
  },
};

