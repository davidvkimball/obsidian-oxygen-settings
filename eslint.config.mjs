// eslint.config.mjs
import tsparser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";

export default defineConfig([
  {
    ignores: ["main.js", "node_modules/**", "dist/**", "*.js", "scripts/**", ".ref/**"]
  },
  // obsidianmd recommended rules require type info, so only apply to TS files
  ...obsidianmd.configs.recommended.map((config) => ({
    ...config,
    files: config.files ?? ["**/*.ts"],
  })),
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { 
        project: "./tsconfig.json",
        sourceType: "module"
      },
      globals: {
        ...globals.browser,
        DomElementInfo: "readonly",
        SvgElementInfo: "readonly",
        activeDocument: "readonly",
        activeWindow: "readonly",
        ajax: "readonly",
        ajaxPromise: "readonly",
        createDiv: "readonly",
        createEl: "readonly",
        createFragment: "readonly",
        createSpan: "readonly",
        createSvg: "readonly",
        fish: "readonly",
        fishAll: "readonly",
        isBoolean: "readonly",
        nextFrame: "readonly",
        ready: "readonly",
        sleep: "readonly"
      }
    },
    // Custom rule overrides
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-function": "off",
      "no-prototype-builtins": "off",
      "@typescript-eslint/no-misused-promises": ["error",{"checksVoidReturn":{"attributes":false,"properties":false,"returns":false,"variables":false}}],
      // Console rules: Match Obsidian bot requirements (only warn/error/debug allowed)
      "no-console": ["error", { "allow": ["warn", "error", "debug"] }],
      // Require await in async functions (matches Obsidian bot)
      "@typescript-eslint/require-await": "error",
      // Allow project-specific acronyms, third-party plugin/theme brand names,
      // and common dropdown option labels that legitimately appear with title-case.
      "obsidianmd/ui/sentence-case": ["error", {
        acronyms: ["HSL", "RGB", "CSS", "JSON", "ID"],
        brands: ["Style Settings", "Dataview", "Rosé Pine", "Obsidian"],
        ignoreWords: ["Documentation", "Default", "Playful"],
      }],
    },
  },
  {
    files: ["**/*.mjs"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly"
      }
    }
  },
]);
