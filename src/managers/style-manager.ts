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
  private tabObserver: MutationObserver | null = null;
  private sidebarObserver: MutationObserver | null = null;

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
    
    // Watch for tab changes to toggle single-tab class
    if (this.plugin.settings.autoHideTabBarWhenSingleTab) {
      this.setupTabObserver();
    }
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
    
    // Cleanup tab observer
    this.cleanupTabObserver();
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
    // Workspace borders: 'enhanced' | 'default' | 'none'
    // - 'enhanced' (default): Do nothing - theme's default behavior applies (body:not(.borders-on))
    // - 'default': Add borders-on to restore Obsidian's original borders
    // - 'none': Add borders-none to remove all borders
    const bordersValue = this.plugin.settings.workspaceBorders;
    if (bordersValue === 'enhanced') {
      // Enhanced is default - remove any border classes to let theme handle it
      document.body.classList.remove('borders-none', 'borders-on');
    } else if (bordersValue === 'default') {
      // Default - restore Obsidian's original borders
      document.body.classList.remove('borders-none');
      document.body.classList.add('borders-on');
    } else if (bordersValue === 'none') {
      // None - remove all borders
      document.body.classList.remove('borders-on');
      document.body.classList.add('borders-none');
    }
    
    document.body.classList.toggle('colorful-headings', this.plugin.settings.colorfulHeadings);
    document.body.classList.toggle('colorful-frame', this.plugin.settings.colorfulFrame);
    document.body.classList.toggle('colorful-active', this.plugin.settings.colorfulActiveStates);
    document.body.classList.toggle('oxygen-focus-mode', this.plugin.settings.focusMode);
    document.body.classList.toggle('enable-blur', this.plugin.settings.enableBlur);
    document.body.classList.toggle('links-int-on', this.plugin.settings.underlineInternal);
    document.body.classList.toggle('links-ext-on', this.plugin.settings.underlineExternal);
    document.body.classList.toggle('full-width-media', this.plugin.settings.fullWidthMedia);
    document.body.classList.toggle('img-grid', this.plugin.settings.imgGrid);
    document.body.classList.toggle('oxygen-dev-block-width', this.plugin.settings.devBlockWidth);
    document.body.classList.toggle('oxygen-status-off', !this.plugin.settings.minimalStatus);
    document.body.classList.toggle('full-file-names', !this.plugin.settings.trimNames);
    document.body.classList.toggle('labeled-nav', this.plugin.settings.labeledNav);
    document.body.classList.toggle('oxygen-folding', this.plugin.settings.folding);

    // Focus classes (only features not in UI Tweaker)
    document.body.classList.toggle('deemphasize-properties', this.plugin.settings.deemphasizeProperties);
    document.body.classList.toggle('auto-hide-tab-bar-when-single-tab', this.plugin.settings.autoHideTabBarWhenSingleTab);
    
    // Setup or cleanup tab observer based on setting
    if (this.plugin.settings.autoHideTabBarWhenSingleTab) {
      this.setupTabObserver();
      // Add OS-specific class for styling
      const os = this.detectOS();
      document.body.classList.remove('auto-hide-tab-bar-windows', 'auto-hide-tab-bar-macos', 'auto-hide-tab-bar-neutral');
      document.body.classList.add(`auto-hide-tab-bar-${os}`);
    } else {
      this.cleanupTabObserver();
      // Remove OS-specific classes
      document.body.classList.remove('auto-hide-tab-bar-windows', 'auto-hide-tab-bar-macos', 'auto-hide-tab-bar-neutral');
    }

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
    // Width: only set if not default (0px - theme now hides guides by default)
    // Color: only set if not "Subtle" (let theme use its default color)
    const isDefaultWidth = this.plugin.settings.navIndentationGuideWidth === '0px';
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
    
    
    // Apply animation settings
    // Remove all animation classes first (including old 'animations-refined' for migration)
    document.body.classList.remove('animations-refined', 'animations-default', 'animations-playful', 'animations-off');
    
    // Get animation personality (default to 'default' if not set for migration)
    const animationPersonality = this.plugin.settings.animationPersonality || 'default';
    
    // Apply personality class
    if (animationPersonality === 'off') {
      document.body.classList.add('animations-off');
      // Speed is automatically 0 when off, but clear the variable to be explicit
      document.body.style.removeProperty('--anim-speed-modifier');
    } else if (animationPersonality === 'playful') {
      document.body.classList.add('animations-playful');
      // Apply speed (only if not "off")
      document.body.style.setProperty('--anim-speed-modifier', this.plugin.settings.animationSpeed.toString());
    } else {
      // default (maps to animations-default class)
      document.body.classList.add('animations-default');
      // Apply speed (only if not "off")
      document.body.style.setProperty('--anim-speed-modifier', this.plugin.settings.animationSpeed.toString());
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
      'oxygen-light',
      'oxygen-light-tonal',
      'oxygen-light-contrast',
      'oxygen-light-white',
      'oxygen-dark',
      'oxygen-dark-tonal',
      'oxygen-dark-black'
    );
  }

  /**
   * Remove light scheme classes
   */
  removeLightScheme(): void {
    document.body.removeClass(...LIGHT_SCHEMES);
    
    // Remove custom preset classes
    this.plugin.settings.customPresets.forEach(preset => {
      document.body.removeClass(`oxygen-custom-${preset.id}`);
    });
  }

  /**
   * Remove dark scheme classes
   */
  removeDarkScheme(): void {
    document.body.removeClass(...DARK_SCHEMES);
    
    // Remove custom preset classes
    this.plugin.settings.customPresets.forEach(preset => {
      document.body.removeClass(`oxygen-custom-${preset.id}`);
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
      'oxygen-focus-mode',
      'links-int-on',
      'links-ext-on',
      'full-width-media',
      'img-grid',
      'oxygen-dev-block-width',
      'oxygen-status-off',
      'full-file-names',
      'labeled-nav',
      'oxygen-folding',
      'deemphasize-properties',
      'auto-hide-tab-bar-when-single-tab',
      'enable-blur',
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
    document.body.style.removeProperty('--anim-speed-modifier');
    
    document.body.classList.remove(CSS_CLASSES.PLUGIN_THEME);
  }

  /**
   * Setup CSS watcher for re-applying custom presets
   */
  private setupCSSWatcher(): void {
    // CSS watcher disabled - was causing infinite loops
    // Custom preset CSS is now only updated when explicitly called
  }

  /**
   * Setup observer to watch for tab changes and toggle single-tab class
   * Also checks sidebar states to conditionally hide view-header-left and view-actions
   */
  private setupTabObserver(): void {
    if (this.tabObserver) {
      return; // Already set up
    }

    const checkTabs = () => {
      const modRoots = document.querySelectorAll('.mod-root');
      modRoots.forEach((modRoot) => {
        const workspaceTabs = modRoot.querySelector('.workspace-tabs:not(.mod-stacked)');
        if (workspaceTabs) {
          const tabHeaders = workspaceTabs.querySelectorAll('.workspace-tab-header');
          const hasSingleTab = tabHeaders.length === 1;
          
          // Check sidebar states using DOM classes - most reliable method
          // Query fresh each time to ensure we get current state
          // Try multiple selectors to find the right element
          const leftSidebarEl = document.querySelector('.workspace-split.mod-left-split') || 
                                document.querySelector('.mod-left-split');
          const rightSidebarEl = document.querySelector('.workspace-split.mod-right-split') || 
                                 document.querySelector('.mod-right-split');
          
          // Check for the is-sidedock-collapsed class - this is the most reliable indicator
          const leftSidebarCollapsed = leftSidebarEl ? leftSidebarEl.classList.contains('is-sidedock-collapsed') : false;
          const rightSidebarCollapsed = rightSidebarEl ? rightSidebarEl.classList.contains('is-sidedock-collapsed') : false;
          
          
          // Also check API and width for debugging
          const leftSplit = this.plugin.app.workspace.leftSplit;
          const rightSplit = this.plugin.app.workspace.rightSplit;
          const leftSidebarCollapsedAPI = leftSplit.collapsed;
          const rightSidebarCollapsedAPI = rightSplit.collapsed;
          
          const getSidebarWidth = (el: Element | null): number => {
            if (!el) return 0;
            const rect = (el as HTMLElement).getBoundingClientRect();
            return rect.width;
          };
          
          const leftWidth = getSidebarWidth(leftSidebarEl);
          const rightWidth = getSidebarWidth(rightSidebarEl);
          
          
          // CRITICAL: Always clean up inline styles first to prevent them from persisting
          // This ensures that CSS classes control visibility, not stuck inline styles
          // Clean up synchronously before adding/removing classes
          const viewActions = modRoot.querySelectorAll('.view-header .view-actions');
          viewActions.forEach((el) => {
            const htmlEl = el as HTMLElement;
            // Remove any inline display styles that might have been set previously
            // Check if display is set to 'none' with important priority
            const displayValue = htmlEl.style.getPropertyValue('display');
            const displayPriority = htmlEl.style.getPropertyPriority('display');
            if (displayValue === 'none' && displayPriority === 'important') {
              htmlEl.style.removeProperty('display');
            }
          });
          
          // Remove all single-tab related classes first
          modRoot.classList.remove(
            'has-single-tab',
            'has-single-tab-left-collapsed',
            'has-single-tab-right-collapsed'
          );
          
          if (hasSingleTab) {
            modRoot.classList.add('has-single-tab');
            
            // Add specific classes based on sidebar states
            // Only hide view-header-left if left sidebar is NOT expanded (is collapsed)
            if (leftSidebarCollapsed) {
              modRoot.classList.add('has-single-tab-left-collapsed');
            }
            
            // Only hide view-actions if right sidebar is NOT expanded (is collapsed)
            // Let CSS handle the hiding - no inline styles needed
            if (rightSidebarCollapsed) {
              modRoot.classList.add('has-single-tab-right-collapsed');
            }
          }
        }
      });
    };

    // Debounce function to avoid rapid toggling during animations
    let checkTimeout: number | null = null;
    const debouncedCheckTabs = () => {
      if (checkTimeout) {
        clearTimeout(checkTimeout);
      }
      checkTimeout = window.setTimeout(() => {
        checkTabs();
        checkTimeout = null;
      }, 150); // 150ms debounce
    };

    // Initial check
    setTimeout(checkTabs, 100);

    // Watch for changes in workspace
    this.tabObserver = new MutationObserver(() => {
      debouncedCheckTabs();
    });

    // Observe the workspace container
    const workspace = document.querySelector('.workspace');
    if (workspace) {
      this.tabObserver.observe(workspace, {
        childList: true,
        subtree: true
      });
    }

    // Also listen to workspace layout changes (includes sidebar toggles)
    this.plugin.registerEvent(
      this.plugin.app.workspace.on('layout-change', () => {
        debouncedCheckTabs();
      })
    );

    // Watch for class changes on sidebar elements specifically
    const leftSidebarEl = document.querySelector('.workspace-split.mod-left-split');
    const rightSidebarEl = document.querySelector('.workspace-split.mod-right-split');
    
    if (leftSidebarEl) {
      this.sidebarObserver = new MutationObserver((mutations) => {
        let shouldCheck = false;
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            shouldCheck = true;
          }
        });
        if (shouldCheck) {
          debouncedCheckTabs();
        }
      });
      
      this.sidebarObserver.observe(leftSidebarEl, {
        attributes: true,
        attributeFilter: ['class']
      });
      
      if (rightSidebarEl && rightSidebarEl !== leftSidebarEl) {
        this.sidebarObserver.observe(rightSidebarEl, {
          attributes: true,
          attributeFilter: ['class']
        });
      }
    }
  }

  /**
   * Cleanup tab observer
   */
  private cleanupTabObserver(): void {
    if (this.tabObserver) {
      this.tabObserver.disconnect();
      this.tabObserver = null;
    }
    
    if (this.sidebarObserver) {
      this.sidebarObserver.disconnect();
      this.sidebarObserver = null;
    }
    
    // Remove all single-tab related classes from all mod-roots
    document.querySelectorAll('.mod-root').forEach((el) => {
      el.classList.remove(
        'has-single-tab',
        'has-single-tab-left-collapsed',
        'has-single-tab-right-collapsed'
      );
    });
    
    // Remove OS-specific classes
    document.body.classList.remove('auto-hide-tab-bar-windows', 'auto-hide-tab-bar-macos', 'auto-hide-tab-bar-neutral');
  }

}

