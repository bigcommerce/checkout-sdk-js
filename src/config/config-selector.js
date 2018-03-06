export default class ConfigSelector {
    /**
     * @constructor
     * @param {ConfigState} config
     */
    constructor(config = {}) {
        this._config = config;
    }

    /**
     * @return {Config}
     */
    getConfig() {
        return this._config.data;
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadError() {
        return this._config.errors && this._config.errors.loadError;
    }

    /**
     * @return {boolean}
     */
    isLoading() {
        return !!(this._config.statuses && this._config.statuses.isLoading);
    }
}
