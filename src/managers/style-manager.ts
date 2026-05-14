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
import { Platform } from 'obsidian';

export class StyleManagerImpl {
  private plugin: PluginContext;
  private cssObserver: MutationObserver | null = null;
  private customPresetCSS: CustomPresetCSS;

  constructor(plugin: PluginContext) {
    this.plugin = plugin;
    this.customPresetCSS = new CustomPresetCSS(plugin);
  }

  /**
   * Detect OS for OS-specific styling
   */
  private detectOS(): 'windows' | 'macos' | 'neutral' {
    if (Platform.isMacOS) {
      return 'macos';
    }
    if (Platform.isWin) {
      return 'windows';
    }
    return 'neutral';
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
      activeDocument.body.addClass(this.plugin.settings.lightStyle);
    }
    if (this.plugin.settings.darkStyle && this.plugin.settings.darkStyle.trim()) {
      activeDocument.body.addClass(this.plugin.settings.darkStyle);
    }

    // Update schemes based on current theme mode
    try {
      if (activeDocument.body.classList.contains('theme-light')) {
        this.updateLightScheme();
      } else if (activeDocument.body.classList.contains('theme-dark')) {
        this.updateDarkScheme();
      } else {
        // Default to light theme
        activeDocument.body.addClass('theme-light');
        this.updateLightScheme();
      }
    } catch (error) {
      console.error('Error updating schemes:', error);
    }

    // Apply feature toggles
    // Workspace borders: 'enhanced' | 'default' | 'none'
    // - 'enhanced' (default): Do nothing - theme's default behavior applies (body:not(.borders-on))
    // - 'default': Add borders-on to restore Obsidian's original borders
    // - 'none': Add borders-none to remove all borders
    const bordersValue = this.plugin.settings.workspaceBorders;
    if (bordersValue === 'enhanced') {
      // Enhanced is default - remove any border classes to let theme handle it
      activeDocument.body.classList.remove('borders-none', 'borders-on');
    } else if (bordersValue === 'default') {
      // Default - restore Obsidian's original borders
      activeDocument.body.classList.remove('borders-none');
      activeDocument.body.classList.add('borders-on');
    } else if (bordersValue === 'none') {
      // None - remove all borders
      activeDocument.body.classList.remove('borders-on');
      activeDocument.body.classList.add('borders-none');
    }

    activeDocument.body.classList.toggle('colorful-headings', this.plugin.settings.colorfulHeadings);
    activeDocument.body.classList.toggle('colorful-frame', this.plugin.settings.colorfulFrame);
    activeDocument.body.classList.toggle('colorful-active', this.plugin.settings.colorfulActiveStates);
    activeDocument.body.classList.toggle('enable-blur', this.plugin.settings.enableBlur);
    activeDocument.body.classList.toggle('links-int-on', this.plugin.settings.underlineInternal);
    activeDocument.body.classList.toggle('links-ext-on', this.plugin.settings.underlineExternal);
    activeDocument.body.classList.toggle('full-width-media', this.plugin.settings.fullWidthMedia);
    activeDocument.body.classList.toggle('img-grid', this.plugin.settings.imgGrid);
    activeDocument.body.classList.toggle('oxygen-dev-block-width', this.plugin.settings.devBlockWidth);
    activeDocument.body.classList.toggle('oxygen-status-off', !this.plugin.settings.minimalStatus);
    activeDocument.body.classList.toggle('full-file-names', !this.plugin.settings.trimNames);
    activeDocument.body.classList.toggle('labeled-nav', this.plugin.settings.labeledNav);
    activeDocument.body.classList.toggle('oxygen-folding', this.plugin.settings.folding);
    activeDocument.body.classList.toggle('use-default-folder-icon', this.plugin.settings.useDefaultFolderIcon);

    // Add width classes
    activeDocument.body.addClass(
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
    // Width: only set if not default (0px - theme now hides guides by default)
    // Color: only set if not "Subtle" (let theme use its default color)
    const isDefaultWidth = this.plugin.settings.navIndentationGuideWidth === '0px';
    const isDefaultColor = this.plugin.settings.navIndentationGuideColor === 'rgba(var(--mono-rgb-100), 0.12)';

    if (!isDefaultWidth) {
      cssProps['--nav-indentation-guide-width'] = this.plugin.settings.navIndentationGuideWidth;
    } else {
      // Remove width variable to let theme use default
      activeDocument.body.style.removeProperty('--nav-indentation-guide-width');
    }

    if (!isDefaultColor) {
      cssProps['--nav-indentation-guide-color'] = this.plugin.settings.navIndentationGuideColor;
    } else {
      // Remove color variable to let theme use its default color
      activeDocument.body.style.removeProperty('--nav-indentation-guide-color');
    }

    setCssProps(activeDocument.body, cssProps);


    // Apply animation settings
    // Remove all animation classes first (including old 'animations-refined' for migration)
    activeDocument.body.classList.remove('animations-refined', 'animations-default', 'animations-playful', 'animations-off');

    // Get animation personality (default to 'default' if not set for migration)
    const animationPersonality = this.plugin.settings.animationPersonality || 'default';

    // Apply personality class
    if (animationPersonality === 'off') {
      activeDocument.body.classList.add('animations-off');
      // Speed is automatically 0 when off, but clear the variable to be explicit
      activeDocument.body.style.removeProperty('--anim-speed-modifier');
    } else if (animationPersonality === 'playful') {
      activeDocument.body.classList.add('animations-playful');
      // Apply speed (only if not "off")
      activeDocument.body.style.setProperty('--anim-speed-modifier', this.plugin.settings.animationSpeed.toString());
    } else {
      // default (maps to animations-default class)
      activeDocument.body.classList.add('animations-default');
      // Apply speed (only if not "off")
      activeDocument.body.style.setProperty('--anim-speed-modifier', this.plugin.settings.animationSpeed.toString());
    }

    this.customPresetCSS.updateCSS();

    // Re-apply user's custom accent as inline styles after all style updates.
    // This ensures the user's accent overrides both:
    // - Built-in scheme CSS class selectors (e.g., .oxygen-flexoki-dark { --accent-h: 175; })
    // - Custom preset <style> element rules
    // Inline styles have the highest CSS specificity, so the user's choice always wins.
    this.customPresetCSS.applyUserAccentInline();
  }

  /**
   * Update light mode style
   */
  updateLightStyle(): void {
    // Only apply styles if Oxygen theme is active
    if (!this.plugin.isOxygenThemeActive()) {
      return;
    }

    this.removeStyle();
    activeDocument.body.removeClass('theme-dark');
    activeDocument.body.addClass('theme-light', this.plugin.settings.lightStyle);

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

    this.removeStyle();
    activeDocument.body.removeClass('theme-light');
    activeDocument.body.addClass('theme-dark', this.plugin.settings.darkStyle);

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

    if (!activeDocument.body.classList.contains('theme-light')) {
      activeDocument.body.removeClass('theme-dark');
      activeDocument.body.addClass('theme-light');
    }

    // Only add class if scheme is not empty
    if (this.plugin.settings.lightScheme && this.plugin.settings.lightScheme.trim()) {
      activeDocument.body.addClass(this.plugin.settings.lightScheme);
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

    if (!activeDocument.body.classList.contains('theme-dark')) {
      activeDocument.body.removeClass('theme-light');
      activeDocument.body.addClass('theme-dark');
    }

    // Only add class if scheme is not empty
    if (this.plugin.settings.darkScheme && this.plugin.settings.darkScheme.trim()) {
      activeDocument.body.addClass(this.plugin.settings.darkScheme);
    }
  }


  /**
   * Remove style classes
   */
  removeStyle(): void {
    activeDocument.body.removeClass(
      'oxygen-light',
      'oxygen-light-tonal',
      'oxygen-light-contrast',
      'oxygen-light-white',
      'oxygen-dark',
      'oxygen-dark-tonal',
      'oxygen-dark-black',
      // Legacy or mis-prefixed classes that might be sticking
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
    activeDocument.body.removeClass(...LIGHT_SCHEMES);

    // Remove custom preset classes
    this.plugin.settings.customPresets.forEach(preset => {
      activeDocument.body.removeClass(`oxygen-custom-${preset.id}`);
    });
  }

  /**
   * Remove dark scheme classes
   */
  removeDarkScheme(): void {
    activeDocument.body.removeClass(...DARK_SCHEMES);

    // Remove custom preset classes
    this.plugin.settings.customPresets.forEach(preset => {
      activeDocument.body.removeClass(`oxygen-custom-${preset.id}`);
    });
  }

  /**
   * Remove settings classes
   */
  removeSettings(): void {
    activeDocument.body.removeClass(
      'borders-none',
      'borders-on',
      'colorful-headings',
      'colorful-frame',
      'colorful-active',
      'links-int-on',
      'links-ext-on',
      'full-width-media',
      'img-grid',
      'oxygen-dev-block-width',
      'oxygen-status-off',
      'full-file-names',
      'labeled-nav',
      'oxygen-folding',
      'enable-blur',
      'use-default-folder-icon',
      'animations-refined',
      'animations-default',
      'animations-playful',
      'animations-off',
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

    activeDocument.body.classList.add(CSS_CLASSES.PLUGIN_THEME);

    // Update styles once - matches original plugin behavior
    this.updateStyle();
  }

  /**
   * Unload CSS rules
   */
  private unloadRules(): void {
    // Remove CSS custom properties
    activeDocument.body.style.removeProperty('--font-ui-small');
    activeDocument.body.style.removeProperty('--line-height');
    activeDocument.body.style.removeProperty('--line-width');
    activeDocument.body.style.removeProperty('--line-width-wide');
    activeDocument.body.style.removeProperty('--max-width');
    activeDocument.body.style.removeProperty('--font-editor-override');
    activeDocument.body.style.removeProperty('--nav-indentation-guide-width');
    activeDocument.body.style.removeProperty('--nav-indentation-guide-color');
    activeDocument.body.style.removeProperty('--anim-speed-modifier');

    activeDocument.body.classList.remove(CSS_CLASSES.PLUGIN_THEME);
  }

  /**
   * Setup CSS watcher for re-applying custom presets
   */
  private setupCSSWatcher(): void {
    // CSS watcher disabled - was causing infinite loops
    // Custom preset CSS is now only updated when explicitly called
  }

}

