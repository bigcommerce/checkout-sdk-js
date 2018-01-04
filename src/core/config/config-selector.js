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
}
