/**
 * CSS Property Utilities
 * Helper functions for setting CSS custom properties in an Obsidian-compliant way
 */

/**
 * Set CSS custom property on an element
 * This is a wrapper around setProperty that can be replaced with setCssProps if available
 */
export function setCssProps(element: HTMLElement, props: Record<string, string>): void {
  for (const [key, value] of Object.entries(props)) {
    element.style.setProperty(key, value);
  }
}

/**
 * Set a single CSS custom property on an element
 */
export function setCssProp(element: HTMLElement, prop: string, value: string): void {
  element.style.setProperty(prop, value);
}

