import { App } from 'obsidian';
import { MinimalSettings } from '../settings/settings-interface';

export class MigrationRunner {
    private app: App;
    private settings: MinimalSettings;

    constructor(app: App, settings: MinimalSettings) {
        this.app = app;
        this.settings = settings;
    }

    // eslint-disable-next-line @typescript-eslint/require-await -- migrations are currently synchronous but the async contract is preserved for callers that may add async migrations later
    public async run(): Promise<boolean> {
        let migrated = false;

        // 1. Migration for minimal- to oxygen- prefix (run once per user)
        const migrationVersion = 'minimal-to-oxygen-prefix-v1';
        if (!this.settings._migrationVersions || !this.settings._migrationVersions.includes(migrationVersion)) {
            let prefixMigrated = false;

            // Migrate style settings
            if (this.settings.lightStyle && this.settings.lightStyle.startsWith('minimal-')) {
                this.settings.lightStyle = this.settings.lightStyle.replace(/^minimal-/, 'oxygen-');
                prefixMigrated = true;
            }
            if (this.settings.darkStyle && this.settings.darkStyle.startsWith('minimal-')) {
                this.settings.darkStyle = this.settings.darkStyle.replace(/^minimal-/, 'oxygen-');
                prefixMigrated = true;
            }

            // Migrate color scheme settings
            if (this.settings.lightScheme && this.settings.lightScheme.startsWith('minimal-')) {
                this.settings.lightScheme = this.settings.lightScheme.replace(/^minimal-/, 'oxygen-');
                prefixMigrated = true;
            }
            if (this.settings.darkScheme && this.settings.darkScheme.startsWith('minimal-')) {
                this.settings.darkScheme = this.settings.darkScheme.replace(/^minimal-/, 'oxygen-');
                prefixMigrated = true;
            }

            // Mark migration as complete
            if (prefixMigrated) {
                if (!this.settings._migrationVersions) {
                    this.settings._migrationVersions = [];
                }
                this.settings._migrationVersions.push(migrationVersion);
                migrated = true;
                console.debug('[Oxygen Settings] Migrated settings from minimal- to oxygen- prefix');
            }
        }

        // 2. Migration for renamed default schemes
        if (this.settings.lightScheme === 'minimal-default-light') {
            this.settings.lightScheme = 'oxygen-minimal-light';
            migrated = true;
        }
        if (this.settings.darkScheme === 'minimal-default-dark') {
            this.settings.darkScheme = 'oxygen-minimal-dark';
            migrated = true;
        }

        // 3. Migration for workspace borders: convert old bordersToggle + workspaceBordersEnhanced to new workspaceBorders dropdown
        // Note: We need the raw loaded data if we want to check for the absence of workspaceBorders
        // but the current logic in main.ts uses this.settings. Since we are refactoring, we'll follow the logic.
        // However, looking at original main.ts, it uses loadedData to check if workspaceBorders is undefined.
        // Let's adjust the runner to accept loadedData or handle it.

        // 4. Migration for animation personality: convert 'refined' to 'default'
        if ((this.settings.animationPersonality as unknown) === 'refined') {
            this.settings.animationPersonality = 'default';
            migrated = true;
        }

        return migrated;
    }

    /**
     * Specifically handles the workspace borders migration which requires checking if a value was previously set.
     */
    public migrateWorkspaceBorders(loadedData: unknown): boolean {
        if (loadedData && typeof loadedData === 'object') {
            const legacyData = loadedData as { bordersToggle?: boolean; workspaceBordersEnhanced?: boolean; workspaceBorders?: string };
            if (legacyData.bordersToggle !== undefined || legacyData.workspaceBordersEnhanced !== undefined) {
                if (legacyData.workspaceBorders === undefined) {
                    if (legacyData.bordersToggle === false) {
                        this.settings.workspaceBorders = 'none';
                    } else if (legacyData.workspaceBordersEnhanced === true) {
                        this.settings.workspaceBorders = 'enhanced';
                    } else {
                        this.settings.workspaceBorders = 'default';
                    }
                    return true;
                }
            }
        }
        return false;
    }
}
