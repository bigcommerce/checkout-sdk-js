"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConfigSelector = (function () {
    function ConfigSelector(_config) {
        if (_config === void 0) { _config = {}; }
        this._config = _config;
    }
    ConfigSelector.prototype.getConfig = function () {
        return this._config.data;
    };
    ConfigSelector.prototype.getLoadError = function () {
        return this._config.errors && this._config.errors.loadError;
    };
    ConfigSelector.prototype.isLoading = function () {
        return !!(this._config.statuses && this._config.statuses.isLoading);
    };
    return ConfigSelector;
}());
exports.default = ConfigSelector;
//# sourceMappingURL=config-selector.js.map