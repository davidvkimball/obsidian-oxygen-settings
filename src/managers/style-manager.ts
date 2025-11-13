/**
 * Style Manager
 * Handles all CSS application, scheme switching, and style updates
 */

import { PluginContext } from '../types';
import { CustomPresetCSS } from './custom-preset-css';
import { 
  CSS_CLASSES, 
  LIGHT_SCHEMES, 
  DARK_SCHEMES
} from '../constants';
import { setTheme, getVaultConfig, setVaultConfig } from '../types/obsidian-extensions';
import { setCssProps } from '../utils/css-props';

export class StyleManagerImpl {
  private plugin: PluginContext;
  private cssObserver: MutationObserver | null = null;
  private customPresetCSS: CustomPresetCSS;

  constructor(plugin: PluginContext) {
    this.plugin = plugin;
    this.customPresetCSS = new CustomPresetCSS(plugin);
  }

  /**
   * Initialize style management
   */
  initialize(): void {
    this.loadRules();
    // CSS watcher removed - it was causing infinite loops
    // Custom preset CSS updates are handled by settings UI and theme switches
  }
  
  /**
   * Initialize custom preset CSS (called after main load completes)
   */
  initializeCustomPresets(): void {
    this.customPresetCSS.initialize();
  }

  /**
   * Cleanup on plugin unload
   */
  cleanup(): void {
    this.unloadRules();
    this.removeStyle();
    this.removeSettings();
    this.removeLightScheme();
    this.removeDarkScheme();
    
    // Cleanup custom preset CSS
    this.customPresetCSS.cleanup();
    
    // Cleanup CSS observer
    if (this.cssObserver) {
      this.cssObserver.disconnect();
      this.cssObserver = null;
    }
  }

  /**
   * Refresh all styles
   */
  refresh(): void {
    // Only refresh styles if Oxygen theme is active
    if (!this.plugin.isOxygenThemeActive()) {
      return;
    }
    this.updateStyle();
  }
  
  /**
   * Update custom preset CSS (public interface)
   */
  updateCustomPresetCSS(): void {
    this.customPresetCSS.updateCSS();
  }

  /**
   * Update all styles based on current settings
   */
  updateStyle(): void {
    // Only apply styles if Oxygen theme is active
    if (!this.plugin.isOxygenThemeActive()) {
      return;
    }
    
    this.removeStyle();
    this.removeSettings();

    // Add style classes (only if not empty)
    if (this.plugin.settings.lightStyle && this.plugin.settings.lightStyle.trim()) {
      document.body.addClass(this.plugin.settings.lightStyle);
    }
    if (this.plugin.settings.darkStyle && this.plugin.settings.darkStyle.trim()) {
      document.body.addClass(this.plugin.settings.darkStyle);
    }

    // Update schemes based on current theme mode
    try {
      if (document.body.classList.contains('theme-light')) {
        this.updateLightScheme();
      } else if (document.body.classList.contains('theme-dark')) {
        this.updateDarkScheme();
      } else {
        // Default to light theme
        document.body.addClass('theme-light');
        this.updateLightScheme();
      }
    } catch (error) {
      console.error('Error updating schemes:', error);
    }

    // Apply feature toggles
    document.body.classList.toggle('borders-none', !this.plugin.settings.bordersToggle);
    document.body.classList.toggle('borders-on', this.plugin.settings.bordersToggle);
    document.body.classList.toggle('colorful-headings', this.plugin.settings.colorfulHeadings);
    document.body.classList.toggle('colorful-frame', this.plugin.settings.colorfulFrame);
    document.body.classList.toggle('colorful-active', this.plugin.settings.colorfulActiveStates);
    document.body.classList.toggle('minimal-focus-mode', this.plugin.settings.focusMode);
    document.body.classList.toggle('links-int-on', this.plugin.settings.underlineInternal);
    document.body.classList.toggle('links-ext-on', this.plugin.settings.underlineExternal);
    document.body.classList.toggle('full-width-media', this.plugin.settings.fullWidthMedia);
    document.body.classList.toggle('img-grid', this.plugin.settings.imgGrid);
    document.body.classList.toggle('minimal-dev-block-width', this.plugin.settings.devBlockWidth);
    document.body.classList.toggle('minimal-status-off', !this.plugin.settings.minimalStatus);
    document.body.classList.toggle('full-file-names', !this.plugin.settings.trimNames);
    document.body.classList.toggle('labeled-nav', this.plugin.settings.labeledNav);
    document.body.classList.toggle('minimal-folding', this.plugin.settings.folding);

    // New feature toggles
    document.body.classList.toggle('workspace-borders-enhanced', this.plugin.settings.workspaceBordersEnhanced);

    // Add width classes
    document.body.addClass(
      this.plugin.settings.chartWidth,
      this.plugin.settings.tableWidth,
      this.plugin.settings.imgWidth,
      this.plugin.settings.iframeWidth,
      this.plugin.settings.mapWidth
    );

    // Update custom CSS variables on body element using setCssProps utility
    const cssProps: Record<string, string> = {
      '--font-ui-small': `${this.plugin.settings.textSmall}px`,
      '--line-height': String(this.plugin.settings.lineHeight),
      '--line-width': `${this.plugin.settings.lineWidth}rem`,
      '--line-width-wide': `${this.plugin.settings.lineWidthWide}rem`,
      '--max-width': `${this.plugin.settings.maxWidth}%`,
      '--font-editor-override': this.plugin.settings.editorFont
    };
    
    // Only set indentation guide variables if they differ from default
    // Width: only set if not default (1px)
    // Color: only set if not "Subtle" (let theme use its default color)
    const isDefaultWidth = this.plugin.settings.navIndentationGuideWidth === '1px';
    const isDefaultColor = this.plugin.settings.navIndentationGuideColor === 'rgba(var(--mono-rgb-100), 0.12)';
    
    if (!isDefaultWidth) {
      cssProps['--nav-indentation-guide-width'] = this.plugin.settings.navIndentationGuideWidth;
    } else {
      // Remove width variable to let theme use default
      document.body.style.removeProperty('--nav-indentation-guide-width');
    }
    
    if (!isDefaultColor) {
      cssProps['--nav-indentation-guide-color'] = this.plugin.settings.navIndentationGuideColor;
    } else {
      // Remove color variable to let theme use its default color
      document.body.style.removeProperty('--nav-indentation-guide-color');
    }
    
    setCssProps(document.body, cssProps);
    
    // Title bar hover behavior - use CSS custom property to control visibility
    // When hideTitleBarOnHover is false (always show), set a custom property
    // The CSS will use this to override the theme's default behavior
    if (!this.plugin.settings.hideTitleBarOnHover) {
      setCssProps(document.body, { '--title-bar-always-visible': '1' });
      document.body.classList.add('always-show-title-bar');
    } else {
      document.body.style.removeProperty('--title-bar-always-visible');
      document.body.classList.remove('always-show-title-bar');
    }
    
    this.customPresetCSS.updateCSS();
  }

  /**
   * Update light mode style
   */
  updateLightStyle(): void {
    // Only apply styles if Oxygen theme is active
    if (!this.plugin.isOxygenThemeActive()) {
      return;
    }
    
    document.body.removeClass(
      'theme-dark',
      'minimal-light',
      'minimal-light-tonal',
      'minimal-light-contrast',
      'minimal-light-white'
    );
    document.body.addClass('theme-light', this.plugin.settings.lightStyle);
    
    const theme = getVaultConfig(this.plugin.app, 'theme');
    if (theme !== 'system') {
      setTheme(this.plugin.app, 'moonstone');
      setVaultConfig(this.plugin.app, 'theme', 'moonstone');
    }
    this.plugin.app.workspace.trigger('css-change');
  }

  /**
   * Update dark mode style
   */
  updateDarkStyle(): void {
    // Only apply styles if Oxygen theme is active
    if (!this.plugin.isOxygenThemeActive()) {
      return;
    }
    
    document.body.removeClass(
      'theme-light',
      'minimal-dark',
      'minimal-dark-tonal',
      'minimal-dark-black'
    );
    document.body.addClass('theme-dark', this.plugin.settings.darkStyle);
    
    const theme = getVaultConfig(this.plugin.app, 'theme');
    if (theme !== 'system') {
      setTheme(this.plugin.app, 'obsidian');
      setVaultConfig(this.plugin.app, 'theme', 'obsidian');
    }
    this.plugin.app.workspace.trigger('css-change');
  }

  /**
   * Update light color scheme
   */
  updateLightScheme(): void {
    // Only apply styles if Oxygen theme is active
    if (!this.plugin.isOxygenThemeActive()) {
      return;
    }
    
    this.removeLightScheme();
    this.removeDarkScheme();
    
    if (!document.body.classList.contains('theme-light')) {
      document.body.removeClass('theme-dark');
      document.body.addClass('theme-light');
    }
    
    // Only add class if scheme is not empty
    if (this.plugin.settings.lightScheme && this.plugin.settings.lightScheme.trim()) {
      document.body.addClass(this.plugin.settings.lightScheme);
    }
  }

  /**
   * Update dark color scheme
   */
  updateDarkScheme(): void {
    // Only apply styles if Oxygen theme is active
    if (!this.plugin.isOxygenThemeActive()) {
      return;
    }
    
    this.removeDarkScheme();
    this.removeLightScheme();
    
    if (!document.body.classList.contains('theme-dark')) {
      document.body.removeClass('theme-light');
      document.body.addClass('theme-dark');
    }
    
    // Only add class if scheme is not empty
    if (this.plugin.settings.darkScheme && this.plugin.settings.darkScheme.trim()) {
      document.body.addClass(this.plugin.settings.darkScheme);
    }
  }


  /**
   * Remove style classes
   */
  removeStyle(): void {
    document.body.removeClass(
      'minimal-light',
      'minimal-light-tonal',
      'minimal-light-contrast',
      'minimal-light-white',
      'minimal-dark',
      'minimal-dark-tonal',
      'minimal-dark-black'
    );
  }

  /**
   * Remove light scheme classes
   */
  removeLightScheme(): void {
    document.body.removeClass(...LIGHT_SCHEMES);
    
    // Remove custom preset classes
    this.plugin.settings.customPresets.forEach(preset => {
      document.body.removeClass(`minimal-custom-${preset.id}`);
    });
  }

  /**
   * Remove dark scheme classes
   */
  removeDarkScheme(): void {
    document.body.removeClass(...DARK_SCHEMES);
    
    // Remove custom preset classes
    this.plugin.settings.customPresets.forEach(preset => {
      document.body.removeClass(`minimal-custom-${preset.id}`);
    });
  }

  /**
   * Remove settings classes
   */
  removeSettings(): void {
    document.body.removeClass(
      'borders-none',
      'borders-on',
      'colorful-headings',
      'colorful-frame',
      'colorful-active',
      'minimal-focus-mode',
      'links-int-on',
      'links-ext-on',
      'full-width-media',
      'img-grid',
      'minimal-dev-block-width',
      'minimal-status-off',
      'full-file-names',
      'labeled-nav',
      'minimal-folding',
      'workspace-borders-enhanced',
      'table-wide',
      'table-max',
      'table-100',
      'table-default-width',
      'iframe-wide',
      'iframe-max',
      'iframe-100',
      'iframe-default-width',
      'img-wide',
      'img-max',
      'img-100',
      'img-default-width',
      'chart-wide',
      'chart-max',
      'chart-100',
      'chart-default-width',
      'map-wide',
      'map-max',
      'map-100',
      'map-default-width'
    );
  }

  /**
   * Load CSS rules
   * Uses CSS custom properties on body instead of creating style elements
   */
  private loadRules(): void {
    // Only load CSS rules if Oxygen theme is active
    if (!this.plugin.isOxygenThemeActive()) {
      return;
    }

    document.body.classList.add(CSS_CLASSES.PLUGIN_THEME);
    
    // Update styles once - matches original plugin behavior
    this.updateStyle();
  }

  /**
   * Unload CSS rules
   */
  private unloadRules(): void {
    // Remove CSS custom properties
    document.body.style.removeProperty('--font-ui-small');
    document.body.style.removeProperty('--line-height');
    document.body.style.removeProperty('--line-width');
    document.body.style.removeProperty('--line-width-wide');
    document.body.style.removeProperty('--max-width');
    document.body.style.removeProperty('--font-editor-override');
    document.body.style.removeProperty('--nav-indentation-guide-width');
    document.body.style.removeProperty('--nav-indentation-guide-color');
    
    document.body.classList.remove(CSS_CLASSES.PLUGIN_THEME);
    document.body.classList.remove('always-show-title-bar');
  }

  /**
   * Setup CSS watcher for re-applying custom presets
   */
  private setupCSSWatcher(): void {
    // CSS watcher disabled - was causing infinite loops
    // Custom preset CSS is now only updated when explicitly called
  }
}

