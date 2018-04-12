import LegacyConfig from './legacy-config';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class ConfigSelector {
    /**
     * @constructor
     * @param {ConfigState} config
     */
    constructor(
        private _config: any = {}
    ) {}

    getConfig(): LegacyConfig | undefined {
        return this._config.data;
    }

    getLoadError(): Error | undefined {
        return this._config.errors && this._config.errors.loadError;
    }

    isLoading(): boolean {
        return !!(this._config.statuses && this._config.statuses.isLoading);
    }
}
