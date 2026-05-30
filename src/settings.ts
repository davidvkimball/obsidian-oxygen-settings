/**
 * Settings Tab - Refactored
 * Coordinates all settings sections
 */

import { PluginSettingTab, App, Setting } from 'obsidian';
import MinimalTheme from "./main";
import { buildColorSchemeSettings } from './settings/sections/ColorSchemeSettings';
import { buildFeatureSettings } from './settings/sections/FeatureSettings';
import { buildLayoutSettings } from './settings/sections/LayoutSettings';
import { buildTypographySettings } from './settings/sections/TypographySettings';
import { buildCustomPresetSettings } from './settings/sections/CustomPresetSettings';
import { buildAnimationSettings } from './settings/sections/AnimationSettings';
import { CustomColorPreset } from './presets/CustomPreset';
import { PresetManager } from './presets/PresetManager';
import { PresetEditorModal } from './modals/PresetEditorModal';
import { PresetImportModal } from './modals/PresetImportModal';
import { ConfirmationModal } from './modals/ConfirmationModal';
import { generateColorSwatch } from './utils/color-utils';
import { updateObsidianAccentColor } from './utils/theme-utils';

// Re-export from settings-interface for backward compatibility
export type { MinimalSettings } from './settings/settings-interface';
export { DEFAULT_SETTINGS } from './settings/settings-interface';

export class MinimalSettingsTab extends PluginSettingTab {
  plugin: MinimalTheme;
  public icon = 'lucide-swatch-book';

  // Provided by the framework on 1.13.0+ to re-render the declarative tab.
  // Declared optional so render callbacks can call it safely on any version.
  update?: () => void;

  constructor(app: App, plugin: MinimalTheme) {
    super(app, plugin);
    this.plugin = plugin;
  }

  // 1.13.0+: framework calls this and skips display().
  // Pre-1.13.0: this method is not invoked; display() below runs as before.
  // See https://docs.obsidian.md/plugins/guides/migrate-declarative-settings
  getSettingDefinitions() {
    return [
      // Color scheme group
      {
        type: 'group' as const,
        heading: 'Color scheme',
        items: [
          {
            // False positive: "Style Settings" and "Documentation" are proper nouns
            name: 'Light mode color scheme',
            // False positive: "Style Settings" and "Documentation" are proper nouns
            desc: 'Preset color options for light mode. To create a custom color scheme use the Style Settings plugin. See Documentation for details.',
            // Render: options are dynamic (built-in plus custom presets appended at
            // runtime) and onChange regenerates all CSS including custom presets.
            render: (setting: Setting) => {
              setting.addDropdown(dropdown => {
                dropdown
                  .addOption('oxygen-oxygen-light', 'Oxygen')
                  .addOption('oxygen-minimal-light', 'Minimal')
                  .addOption('oxygen-atom-light', 'Atom')
                  .addOption('oxygen-ayu-light', 'Ayu')
                  .addOption('oxygen-catppuccin-light', 'Catppuccin')
                  .addOption('oxygen-eink-light', 'E-ink (beta)')
                  .addOption('oxygen-everforest-light', 'Everforest')
                  .addOption('oxygen-flexoki-light', 'Flexoki')
                  .addOption('oxygen-gruvbox-light', 'Gruvbox')
                  .addOption('oxygen-macos-light', 'macOS')
                  .addOption('oxygen-nord-light', 'Nord')
                  // False positive: "Rosé Pine" and "Sky" are proper nouns (color scheme names)
                  .addOption('oxygen-rose-pine-light', 'Rosé Pine')
                  .addOption('oxygen-notion-light', 'Sky')
                  .addOption('oxygen-solarized-light', 'Solarized')
                  .addOption('oxygen-things-light', 'Things');

                if (this.plugin.settings.enableCustomPresets && this.plugin.settings.customPresets.length > 0) {
                  this.plugin.settings.customPresets
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .forEach(preset => {
                      dropdown.addOption(`oxygen-custom-${preset.id}`, preset.name);
                    });
                }

                dropdown
                  .setValue(this.plugin.settings.lightScheme)
                  .onChange(value => {
                    this.plugin.settings.lightScheme = value;
                    void this.plugin.saveData(this.plugin.settings);
                    this.plugin.updateStyle();
                    this.plugin.updateCustomPresetCSS();
                  });
              });
            },
          },
          {
            name: 'Light mode background contrast',
            desc: 'Level of contrast between sidebar and main content.',
            control: {
              type: 'dropdown' as const,
              key: 'lightStyle',
              options: {
                'oxygen-light': 'Default',
                'oxygen-light-white': 'All white',
                'oxygen-light-tonal': 'Low contrast',
                'oxygen-light-contrast': 'High contrast',
              },
            },
          },
          {
            name: 'Dark mode color scheme',
            desc: 'Preset colors options for dark mode.',
            // Render: options are dynamic (built-in plus custom presets appended at
            // runtime) and onChange regenerates all CSS including custom presets.
            render: (setting: Setting) => {
              setting.addDropdown(dropdown => {
                dropdown
                  .addOption('oxygen-oxygen-dark', 'Oxygen')
                  .addOption('oxygen-minimal-dark', 'Minimal')
                  .addOption('oxygen-atom-dark', 'Atom')
                  .addOption('oxygen-ayu-dark', 'Ayu')
                  .addOption('oxygen-catppuccin-dark', 'Catppuccin')
                  .addOption('oxygen-dracula-dark', 'Dracula')
                  .addOption('oxygen-eink-dark', 'E-ink (beta)')
                  .addOption('oxygen-everforest-dark', 'Everforest')
                  .addOption('oxygen-flexoki-dark', 'Flexoki')
                  .addOption('oxygen-gruvbox-dark', 'Gruvbox')
                  .addOption('oxygen-macos-dark', 'macOS')
                  .addOption('oxygen-nord-dark', 'Nord')
                  // False positive: "Rosé Pine" and "Sky" are proper nouns (color scheme names)
                  .addOption('oxygen-rose-pine-dark', 'Rosé Pine')
                  .addOption('oxygen-notion-dark', 'Sky')
                  .addOption('oxygen-solarized-dark', 'Solarized')
                  .addOption('oxygen-things-dark', 'Things');

                if (this.plugin.settings.enableCustomPresets && this.plugin.settings.customPresets.length > 0) {
                  this.plugin.settings.customPresets
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .forEach(preset => {
                      dropdown.addOption(`oxygen-custom-${preset.id}`, preset.name);
                    });
                }

                dropdown
                  .setValue(this.plugin.settings.darkScheme)
                  .onChange(value => {
                    this.plugin.settings.darkScheme = value;
                    void this.plugin.saveData(this.plugin.settings);
                    this.plugin.updateStyle();
                    this.plugin.updateCustomPresetCSS();
                  });
              });
            },
          },
          {
            name: 'Dark mode background contrast',
            desc: 'Level of contrast between sidebar and main content.',
            control: {
              type: 'dropdown' as const,
              key: 'darkStyle',
              options: {
                'oxygen-dark': 'Default',
                'oxygen-dark-tonal': 'Low contrast',
                'oxygen-dark-black': 'True black',
              },
            },
          },
        ],
      },
      // Features group
      {
        type: 'group' as const,
        heading: 'Features',
        items: [
          {
            name: 'Text labels for primary navigation',
            // False positive: "Documentation" is a proper noun (section name)
            desc: 'Navigation items in the left sidebar uses text labels. See Documentation for details.',
            control: { type: 'toggle' as const, key: 'labeledNav' },
          },
          {
            name: 'Colorful window frame',
            desc: 'The top area of the app uses your accent color.',
            control: { type: 'toggle' as const, key: 'colorfulFrame' },
          },
          {
            name: 'Colorful active states',
            desc: 'Active file and menu items use your accent color.',
            control: { type: 'toggle' as const, key: 'colorfulActiveStates' },
          },
          {
            name: 'Colorful headings',
            desc: 'Headings use a different color for each size.',
            control: { type: 'toggle' as const, key: 'colorfulHeadings' },
          },
          {
            name: 'Minimal status bar',
            desc: 'Turn off to use full-width status bar.',
            control: { type: 'toggle' as const, key: 'minimalStatus' },
          },
          {
            name: 'Trim file names in sidebars',
            desc: 'Use ellipses to fit file names on a single line.',
            control: { type: 'toggle' as const, key: 'trimNames' },
          },
          {
            name: 'Borders',
            desc: 'Border style for workspace elements.',
            control: {
              type: 'dropdown' as const,
              key: 'workspaceBorders',
              options: { enhanced: 'Enhanced', default: 'Default', none: 'None' },
            },
          },
          {
            name: 'Indentation guides thickness',
            desc: 'Thickness of indentation guides in the sidebar file explorer.',
            control: {
              type: 'dropdown' as const,
              key: 'navIndentationGuideWidth',
              options: { '0px': 'None', '1px': 'Thin', '2px': 'Medium', '3px': 'Thick' },
            },
          },
          {
            name: 'Indentation guides color',
            desc: 'Color of indentation guides in the sidebar.',
            control: {
              type: 'dropdown' as const,
              key: 'navIndentationGuideColor',
              options: {
                'rgba(var(--mono-rgb-100), 0.12)': 'Subtle',
                'var(--text-faint)': 'Strong',
                'var(--color-accent)': 'Accent color',
              },
            },
          },
          {
            name: 'Underline internal links',
            desc: 'Show underlines on internal links.',
            control: { type: 'toggle' as const, key: 'underlineInternal' },
          },
          {
            name: 'Underline external links',
            desc: 'Show underlines on external links.',
            control: { type: 'toggle' as const, key: 'underlineExternal' },
          },
          {
            name: 'Maximize media',
            desc: 'Images and videos fill the width of the line.',
            control: { type: 'toggle' as const, key: 'fullWidthMedia' },
          },
          {
            name: 'Enable background blur',
            desc: 'Adds background blur to modal dialogs. Disable if scrolling becomes laggy. Not available on mobile devices.',
            control: { type: 'toggle' as const, key: 'enableBlur' },
          },
          {
            name: 'Use default Obsidian folder icon',
            desc: 'Toggle to use Obsidian\'s default file explorer icon instead of the folder-closed icon.',
            control: { type: 'toggle' as const, key: 'useDefaultFolderIcon' },
          },
        ],
      },
      // Animations group
      {
        type: 'group' as const,
        heading: 'Animations',
        items: [
          {
            name: 'Animation personality',
            desc: 'Choose the animation style: Default (smooth), Playful (bouncy), or off (disabled).',
            control: {
              type: 'dropdown' as const,
              key: 'animationPersonality',
              options: { default: 'Default', playful: 'Playful', off: 'Off' },
            },
          },
          {
            name: 'Animation speed',
            desc: 'Control the speed of animations. Range: 0 (disabled) to 2 (half speed / slower). Default: 1 (normal speed). Lower values = faster animations, higher values = slower animations.',
            // Driver (animationPersonality) is a control, so the framework re-evaluates
            // this predicate automatically when it changes.
            visible: () => this.plugin.settings.animationPersonality !== 'off',
            control: { type: 'slider' as const, key: 'animationSpeed', min: 0, max: 2, step: 0.1 },
          },
        ],
      },
      // Layout group
      {
        type: 'group' as const,
        heading: 'Layout',
        items: [
          {
            name: 'Image grids',
            // False positive: "Documentation" is a proper noun (section name)
            desc: 'Turn consecutive images into columns. To make a new row, add an extra line break between images. These options can also be defined on a per-file basis, see Documentation for details.',
            control: { type: 'toggle' as const, key: 'imgGrid' },
          },
          {
            name: 'Chart width',
            desc: 'Default width for chart blocks.',
            control: {
              type: 'dropdown' as const,
              key: 'chartWidth',
              options: {
                'chart-default-width': 'Default',
                'chart-wide': 'Wide line width',
                'chart-max': 'Maximum line width',
                'chart-100': '100% pane width',
              },
            },
          },
          {
            name: 'Iframe width',
            desc: 'Default width for iframe blocks.',
            control: {
              type: 'dropdown' as const,
              key: 'iframeWidth',
              options: {
                'iframe-default-width': 'Default',
                'iframe-wide': 'Wide line width',
                'iframe-max': 'Maximum line width',
                'iframe-100': '100% pane width',
              },
            },
          },
          {
            name: 'Image width',
            desc: 'Default width for image blocks.',
            control: {
              type: 'dropdown' as const,
              key: 'imgWidth',
              options: {
                'img-default-width': 'Default',
                'img-wide': 'Wide line width',
                'img-max': 'Maximum line width',
                'img-100': '100% pane width',
              },
            },
          },
          {
            name: 'Map width',
            desc: 'Default width for map blocks.',
            control: {
              type: 'dropdown' as const,
              key: 'mapWidth',
              options: {
                'map-default-width': 'Default',
                'map-wide': 'Wide line width',
                'map-max': 'Maximum line width',
                'map-100': '100% pane width',
              },
            },
          },
          {
            name: 'Table width',
            // False positive: "Dataview" is a proper noun (plugin name)
            desc: 'Default width for table and Dataview blocks.',
            control: {
              type: 'dropdown' as const,
              key: 'tableWidth',
              options: {
                'table-default-width': 'Default',
                'table-wide': 'Wide line width',
                'table-max': 'Maximum line width',
                'table-100': '100% pane width',
              },
            },
          },
        ],
      },
      // Typography group
      {
        type: 'group' as const,
        heading: 'Typography',
        items: [
          {
            name: 'Text font size',
            desc: 'Used for the main text (default 16).',
            control: { type: 'number' as const, key: 'textNormal', placeholder: '16' },
          },
          {
            name: 'Small font size',
            desc: 'Used for text in the sidebars and tabs (default 13).',
            control: { type: 'number' as const, key: 'textSmall', placeholder: '13' },
          },
          {
            name: 'Line height',
            desc: 'Line height of text (default 1.5).',
            control: { type: 'number' as const, key: 'lineHeight', placeholder: '1.5' },
          },
          {
            name: 'Normal line width',
            desc: 'Number of characters per line (default 40).',
            control: { type: 'number' as const, key: 'lineWidth', placeholder: '40' },
          },
          {
            name: 'Wide line width',
            desc: 'Number of characters per line for wide elements (default 50).',
            control: { type: 'number' as const, key: 'lineWidthWide', placeholder: '50' },
          },
          {
            name: 'Maximum line width %',
            desc: 'Percentage of space inside a pane that a line can fill (default 88).',
            control: { type: 'number' as const, key: 'maxWidth', placeholder: '88' },
          },
          {
            name: 'Editor font',
            desc: 'Overrides the text font defined in Obsidian appearance settings when in edit mode.',
            control: { type: 'text' as const, key: 'editorFont', placeholder: '' },
          },
        ],
      },
      // Custom color schemes group
      {
        type: 'group' as const,
        heading: 'Custom color schemes',
        items: [
          {
            name: 'Enable custom presets',
            desc: 'Allow creation and use of custom color presets',
            // Render: non-trivial onChange that may reset active custom schemes and
            // re-renders the tab so the management section appears/disappears.
            render: (setting: Setting) => {
              setting.addToggle(toggle => {
                toggle.setValue(this.plugin.settings.enableCustomPresets).onChange(value => {
                  this.plugin.settings.enableCustomPresets = value;

                  // If disabling, reset any active custom preset schemes to default
                  if (!value) {
                    let needsUpdate = false;

                    if (this.plugin.settings.lightScheme.startsWith('oxygen-custom-')) {
                      this.plugin.settings.lightScheme = 'oxygen-oxygen-light';
                      needsUpdate = true;
                    }

                    if (this.plugin.settings.darkScheme.startsWith('oxygen-custom-')) {
                      this.plugin.settings.darkScheme = 'oxygen-oxygen-dark';
                      needsUpdate = true;
                    }

                    if (needsUpdate) {
                      this.plugin.updateStyle();
                      this.plugin.updateCustomPresetCSS();
                    }
                  }

                  void this.plugin.saveData(this.plugin.settings);
                  this.rerender();
                });
              });
            },
          },
          {
            name: 'Custom presets management',
            desc: 'Create, import, and manage custom color presets.',
            // Render: reproduces buildCustomPresetSettings (action buttons, preset
            // list with edit/export/delete, modals). Hidden unless presets enabled.
            visible: () => this.plugin.settings.enableCustomPresets,
            render: (setting: Setting) => {
              this.renderCustomPresetManagement(setting);
            },
          },
        ],
      },
    ];
  }

  // Re-render helper that prefers the framework's update() on 1.13.0+,
  // falling back to display() on older versions.
  private rerender(): void {
    if (typeof this.update === 'function') {
      this.update();
    } else {
      this.display();
    }
  }

  // Reproduces the create/import buttons and preset list of
  // buildCustomPresetSettings as a render def. The hosting Setting's name/desc
  // already provide a searchable label; here we build the interactive controls.
  private renderCustomPresetManagement(setting: Setting): void {
    const refreshCallback = () => this.rerender();

    setting
      .addExtraButton(button => button
        .setIcon('plus')
        .setTooltip('Create new preset')
        .onClick(() => this.openPresetEditor(null, refreshCallback)))
      .addExtraButton(button => button
        .setIcon('download')
        .setTooltip('Import preset')
        .onClick(() => this.openPresetImporter(refreshCallback)));

    const container = setting.settingEl.parentElement ?? setting.settingEl;

    container.createEl('br');

    if (this.plugin.settings.customPresets.length > 0) {
      const presetsList = container.createEl('div', { cls: 'custom-presets-list' });

      this.plugin.settings.customPresets
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(preset => {
          this.addPresetListItem(presetsList, preset, refreshCallback);
        });
    } else {
      const emptyState = container.createEl('div', { cls: 'custom-presets-empty' });
      emptyState.createEl('p', {
        text: 'No custom presets yet. Create your first preset to get started!',
        cls: 'empty-message',
      });
    }

    container.createEl('br');
  }

  private addPresetListItem(
    container: HTMLElement,
    preset: CustomColorPreset,
    refreshCallback: () => void
  ): void {
    const presetItem = container.createEl('div', { cls: 'custom-preset-item' });

    const presetInfo = presetItem.createEl('div', { cls: 'preset-info' });

    const swatch = generateColorSwatch(preset);
    presetInfo.appendChild(swatch);

    const details = presetInfo.createEl('div', { cls: 'preset-details' });
    details.createEl('div', { text: preset.name, cls: 'preset-name' });

    if (preset.author) {
      details.createEl('div', { text: `by ${preset.author}`, cls: 'preset-author' });
    }

    details.createEl('div', { text: preset.id, cls: 'preset-id preset-id-display' });

    new Setting(presetItem)
      .setName('')
      .setDesc('')
      .addExtraButton(button => button
        .setIcon('edit')
        .setTooltip('Edit preset')
        .onClick(() => this.openPresetEditor(preset, refreshCallback)))
      .addExtraButton(button => button
        .setIcon('download')
        .setTooltip('Export preset')
        .onClick(() => this.exportPreset(preset)))
      .addExtraButton(button => button
        .setIcon('trash')
        .setTooltip('Delete preset')
        .onClick(async () => await this.deletePreset(preset, refreshCallback)));
  }

  private openPresetEditor(
    preset: CustomColorPreset | null,
    refreshCallback: () => void
  ): void {
    const modal = new PresetEditorModal(this.app, this.plugin, preset, (updatedPreset) => {
      if (preset) {
        const index = this.plugin.settings.customPresets.findIndex(p => p.id === preset.id);
        if (index !== -1) {
          this.plugin.settings.customPresets[index] = updatedPreset;
        }
      } else {
        this.plugin.settings.customPresets.push(updatedPreset);
      }

      void this.plugin.saveData(this.plugin.settings);

      const presetSchemeId = `oxygen-custom-${updatedPreset.id}`;
      const isActiveLight = this.plugin.settings.lightScheme === presetSchemeId;
      const isActiveDark = this.plugin.settings.darkScheme === presetSchemeId;

      if (isActiveLight || isActiveDark) {
        const isLightMode = activeDocument.body.classList.contains('theme-light');
        if (isLightMode && isActiveLight) {
          updateObsidianAccentColor(this.plugin.app, updatedPreset.light.accent);
        } else if (!isLightMode && isActiveDark) {
          updateObsidianAccentColor(this.plugin.app, updatedPreset.dark.accent);
        }

        this.plugin.updateStyle();
        this.plugin.updateCustomPresetCSS();
      }

      refreshCallback();
    });
    modal.open();
  }

  private openPresetImporter(refreshCallback: () => void): void {
    const modal = new PresetImportModal(this.app, this.plugin, (importedPreset) => {
      this.plugin.settings.customPresets.push(importedPreset);
      void this.plugin.saveData(this.plugin.settings);
      refreshCallback();
    });
    modal.open();
  }

  private exportPreset(preset: CustomColorPreset): void {
    const json = PresetManager.exportPresetAsJSON(preset);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = activeDocument.createElement('a');
    a.href = url;
    a.download = `${preset.id}.json`;
    activeDocument.body.appendChild(a);
    a.click();
    activeDocument.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private async deletePreset(
    preset: CustomColorPreset,
    refreshCallback: () => void
  ): Promise<void> {
    const isActive = PresetManager.isPresetActive(
      preset.id,
      this.plugin.settings.lightScheme,
      this.plugin.settings.darkScheme
    );

    if (isActive) {
      const confirmed = await ConfirmationModal.show(
        this.app,
        'Delete active preset',
        'This preset is currently active. Deleting it will switch to the default scheme. Continue?',
        'Delete'
      );

      if (!confirmed) {
        return;
      }

      if (this.plugin.settings.lightScheme === `oxygen-custom-${preset.id}`) {
        this.plugin.settings.lightScheme = 'oxygen-oxygen-light';
      }
      if (this.plugin.settings.darkScheme === `oxygen-custom-${preset.id}`) {
        this.plugin.settings.darkScheme = 'oxygen-oxygen-dark';
      }
    }

    this.plugin.settings.customPresets = this.plugin.settings.customPresets.filter(p => p.id !== preset.id);
    await this.plugin.saveData(this.plugin.settings);

    this.plugin.updateStyle();
    this.plugin.updateCustomPresetCSS();

    refreshCallback();
  }

  // Read a setting value by key (dot-path aware) for the declarative framework.
  getControlValue(key: string): unknown {
    const settings = this.plugin.settings as unknown as Record<string, unknown>;
    if (!key.includes('.')) {
      return settings[key];
    }
    let current: unknown = settings;
    for (const part of key.split('.')) {
      if (current == null || typeof current !== 'object') {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }
    return current;
  }

  // Write a setting value by key (dot-path aware), persist it, then run the
  // per-key side effect. Mirrors the onChange handlers in the builder functions.
  async setControlValue(key: string, value: unknown): Promise<void> {
    const settings = this.plugin.settings as unknown as Record<string, unknown>;

    if (!key.includes('.')) {
      settings[key] = value;
    } else {
      const parts = key.split('.');
      let current: Record<string, unknown> = settings;
      for (let i = 0; i < parts.length - 1; i++) {
        const next = current[parts[i]];
        if (next == null || typeof next !== 'object') {
          return;
        }
        current = next as Record<string, unknown>;
      }
      current[parts[parts.length - 1]] = value;
    }

    await this.plugin.saveData(this.plugin.settings);

    // Per-key side effects (match the builder onChange handlers).
    switch (key) {
      // Color-scheme contrast: regenerate styles.
      case 'lightStyle':
      case 'darkStyle':
        this.plugin.updateStyle();
        break;
      // Text font size: dedicated font-size update path.
      case 'textNormal':
        this.plugin.setFontSize();
        break;
      // All other control keys (typography, features, layout, animations):
      // refresh the rendered styles.
      default:
        this.plugin.refresh();
        break;
    }
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // Build all settings sections
    buildColorSchemeSettings(containerEl, this.plugin);
    buildCustomPresetSettings(containerEl, this.plugin, this.app, () => this.display());
    buildFeatureSettings(containerEl, this.plugin);
    buildAnimationSettings(containerEl, this.plugin);
    buildLayoutSettings(containerEl, this.plugin);
    buildTypographySettings(containerEl, this.plugin);
  }
}

