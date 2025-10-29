/**
 * Style Manager
 * Handles all CSS application, scheme switching, and style updates
 */

import { PluginContext } from '../types';
import { CustomPresetCSS } from './custom-preset-css';
import { 
  CSS_CLASSES, 
  LIGHT_SCHEMES, 
  DARK_SCHEMES,
  CSS_UPDATE_DELAY,
  CSS_REFLOW_DELAY 
} from '../constants';

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
    // Defer CSS watcher setup to avoid blocking load
    setTimeout(() => {
      this.setupCSSWatcher();
    }, 150);
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
    this.removeStyle();
    this.removeSettings();

    // Add style classes
    document.body.addClass(
      this.plugin.settings.lightStyle,
      this.plugin.settings.darkStyle
    );

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

    // Add width classes
    document.body.addClass(
      this.plugin.settings.chartWidth,
      this.plugin.settings.tableWidth,
      this.plugin.settings.imgWidth,
      this.plugin.settings.iframeWidth,
      this.plugin.settings.mapWidth
    );

    // Update custom CSS variables
    const el = document.getElementById('minimal-theme');
    if (el) {
      const css = 'body.minimal-theme{'
        + '--font-ui-small:' + this.plugin.settings.textSmall + 'px;'
        + '--line-height:' + this.plugin.settings.lineHeight + ';'
        + '--line-width:' + this.plugin.settings.lineWidth + 'rem;'
        + '--line-width-wide:' + this.plugin.settings.lineWidthWide + 'rem;'
        + '--max-width:' + this.plugin.settings.maxWidth + '%;'
        + '--font-editor-override:' + this.plugin.settings.editorFont + ';'
        + '}\n';
      
      el.innerText = css;
      this.customPresetCSS.updateCSS();
    }
  }

  /**
   * Update light mode style
   */
  updateLightStyle(): void {
    document.body.removeClass(
      'theme-dark',
      'minimal-light',
      'minimal-light-tonal',
      'minimal-light-contrast',
      'minimal-light-white'
    );
    document.body.addClass('theme-light', this.plugin.settings.lightStyle);
    
    const app = this.plugin.app as any; // Obsidian internal API
    const theme = app.vault.getConfig('theme');
    if (theme !== 'system') {
      app.setTheme('moonstone');
      app.vault.setConfig('theme', 'moonstone');
    }
    this.plugin.app.workspace.trigger('css-change');
  }

  /**
   * Update dark mode style
   */
  updateDarkStyle(): void {
    document.body.removeClass(
      'theme-light',
      'minimal-dark',
      'minimal-dark-tonal',
      'minimal-dark-black'
    );
    document.body.addClass('theme-dark', this.plugin.settings.darkStyle);
    
    const app = this.plugin.app as any; // Obsidian internal API
    const theme = app.vault.getConfig('theme');
    if (theme !== 'system') {
      app.setTheme('obsidian');
      app.vault.setConfig('theme', 'obsidian');
    }
    this.plugin.app.workspace.trigger('css-change');
  }

  /**
   * Update light color scheme
   */
  updateLightScheme(): void {
    this.removeLightScheme();
    this.removeDarkScheme();
    
    if (!document.body.classList.contains('theme-light')) {
      document.body.removeClass('theme-dark');
      document.body.addClass('theme-light');
    }
    
    document.body.addClass(this.plugin.settings.lightScheme);
  }

  /**
   * Update dark color scheme
   */
  updateDarkScheme(): void {
    this.removeDarkScheme();
    this.removeLightScheme();
    
    if (!document.body.classList.contains('theme-dark')) {
      document.body.removeClass('theme-light');
      document.body.addClass('theme-dark');
    }
    
    document.body.addClass(this.plugin.settings.darkScheme);
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
   */
  private loadRules(): void {
    const css = document.createElement('style');
    css.id = 'minimal-theme';
    css.setAttribute(CSS_CLASSES.THEME_OVERRIDE, 'true');
    document.getElementsByTagName("head")[0].appendChild(css);

    document.body.classList.add(CSS_CLASSES.PLUGIN_THEME);
    
    // Update styles once - matches original plugin behavior
    this.updateStyle();
  }

  /**
   * Unload CSS rules
   */
  private unloadRules(): void {
    const styleElement = document.getElementById('minimal-theme');
    if (styleElement) {
      styleElement.remove();
    }
    
    document.body.classList.remove(CSS_CLASSES.PLUGIN_THEME);
  }

  /**
   * Setup CSS watcher for re-applying custom presets
   */
  private setupCSSWatcher(): void {
    this.cssObserver = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'STYLE') {
              shouldUpdate = true;
            }
          });
        }
      });
      
      if (shouldUpdate) {
        setTimeout(() => {
          this.customPresetCSS.updateCSS();
        }, CSS_UPDATE_DELAY);
      }
    });
    
    this.cssObserver.observe(document.head, {
      childList: true,
      subtree: true
    });
  }
}

