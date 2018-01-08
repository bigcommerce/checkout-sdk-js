"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConfigSelector = (function () {
    function ConfigSelector(config) {
        if (config === void 0) { config = {}; }
        this._config = config;
    }
    ConfigSelector.prototype.getConfig = function () {
        return this._config.data;
    };
    return ConfigSelector;
}());
exports.default = ConfigSelector;
//# sourceMappingURL=config-selector.js.map