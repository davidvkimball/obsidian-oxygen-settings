/**
 * Width cycling commands for tables, images, iframes, charts, and maps
 */

import { PluginContext } from '../types';
import { 
  COMMAND_IDS, 
  TABLE_WIDTH_STYLES, 
  IMAGE_WIDTH_STYLES, 
  IFRAME_WIDTH_STYLES,
  CHART_WIDTH_STYLES,
  MAP_WIDTH_STYLES
} from '../constants';

export function registerWidthCommands(plugin: PluginContext): void {
  plugin.addCommand({
    id: COMMAND_IDS.CYCLE_TABLE_WIDTH,
    name: 'Cycle between table width options',
    callback: () => {
      const currentIndex = TABLE_WIDTH_STYLES.indexOf(plugin.settings.tableWidth as any);
      const nextIndex = (currentIndex + 1) % TABLE_WIDTH_STYLES.length;
      plugin.settings.tableWidth = TABLE_WIDTH_STYLES[nextIndex];
      plugin.saveData(plugin.settings);
      refresh(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.CYCLE_IMAGE_WIDTH,
    name: 'Cycle between image width options',
    callback: () => {
      const currentIndex = IMAGE_WIDTH_STYLES.indexOf(plugin.settings.imgWidth as any);
      const nextIndex = (currentIndex + 1) % IMAGE_WIDTH_STYLES.length;
      plugin.settings.imgWidth = IMAGE_WIDTH_STYLES[nextIndex];
      plugin.saveData(plugin.settings);
      refresh(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.CYCLE_IFRAME_WIDTH,
    name: 'Cycle between iframe width options',
    callback: () => {
      const currentIndex = IFRAME_WIDTH_STYLES.indexOf(plugin.settings.iframeWidth as any);
      const nextIndex = (currentIndex + 1) % IFRAME_WIDTH_STYLES.length;
      plugin.settings.iframeWidth = IFRAME_WIDTH_STYLES[nextIndex];
      plugin.saveData(plugin.settings);
      refresh(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.CYCLE_CHART_WIDTH,
    name: 'Cycle between chart width options',
    callback: () => {
      const currentIndex = CHART_WIDTH_STYLES.indexOf(plugin.settings.chartWidth as any);
      const nextIndex = (currentIndex + 1) % CHART_WIDTH_STYLES.length;
      plugin.settings.chartWidth = CHART_WIDTH_STYLES[nextIndex];
      plugin.saveData(plugin.settings);
      refresh(plugin);
    }
  });

  plugin.addCommand({
    id: COMMAND_IDS.CYCLE_MAP_WIDTH,
    name: 'Cycle between map width options',
    callback: () => {
      const currentIndex = MAP_WIDTH_STYLES.indexOf(plugin.settings.mapWidth as any);
      const nextIndex = (currentIndex + 1) % MAP_WIDTH_STYLES.length;
      plugin.settings.mapWidth = MAP_WIDTH_STYLES[nextIndex];
      plugin.saveData(plugin.settings);
      refresh(plugin);
    }
  });
}

function refresh(plugin: PluginContext): void {
  // Delegate to style manager (will be implemented)
  if ('updateStyle' in plugin) {
    (plugin as any).updateStyle();
  }
}

