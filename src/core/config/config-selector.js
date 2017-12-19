export default class ConfigSelector {
    /**
     * @constructor
     * @param {ConfigState} config
     */
    constructor(config = {}) {
        this._config = config.data;
    }

    /**
     * @return {Config}
     */
    getConfig() {
        return this._config;
    }
}
