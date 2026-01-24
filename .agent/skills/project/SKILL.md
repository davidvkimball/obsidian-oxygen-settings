---
name: project
description: Project-specific architecture, maintenance tasks, and unique conventions for Oxygen Settings.
---

# Oxygen Settings Project Skill

Configure advanced customization options in the Oxygen Theme. This plugin acts as the configuration layer for the companion Oxygen theme, providing a modular settings interface for theme-specific features.

## Core Architecture

- **Theme Liaison**: Systematically communicates with the Oxygen theme via CSS variables and body classes.
- **Modular Settings**: Organizes theme features into manageable toggles and styling options.
- **UI Management**: Uses a 15KB `styles.css` to provide a polished settings and configuration experience.

## Project-Specific Conventions

- **Variable Injection**: Logic focused on mapping setting states to specific CSS variables defined in the theme.
- **User-Centric Design**: Aims for a "Settings-as-Dashboard" experience for theme customization.
- **Mobile/Desktop Parity**: Ensures customization options are accessible across all Obsidian platforms.

## Key Files

- `src/main.ts`: Main settings registration and theme communication logic.
- `manifest.json`: Plugin identification and id (`oxygen-settings`).
- `styles.css`: Theming for the customization interface and specialized UI modules.
- `esbuild.config.mjs`: Build configuration for bundling settings modules.

## Maintenance Tasks

- **Variable Alignment**: audit injected variables against terminal updates in the Oxygen theme.
- **Settings Hierarchy**: Maintain the logical grouping of theme settings (e.g., Typography, Colors, Layout).
- **Performance**: Ensure settings injection doesn't cause UI flickering or layout shifts.
