"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConfigSelector = /** @class */ (function () {
    /**
     * @constructor
     * @param {ConfigState} config
     */
    function ConfigSelector(config) {
        if (config === void 0) { config = {}; }
        this._config = config.data;
    }
    /**
     * @return {Config}
     */
    ConfigSelector.prototype.getConfig = function () {
        return this._config;
    };
    return ConfigSelector;
}());
exports.default = ConfigSelector;
//# sourceMappingURL=config-selector.js.map