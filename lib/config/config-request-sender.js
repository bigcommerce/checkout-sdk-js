"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConfigRequestSender = (function () {
    function ConfigRequestSender(_requestSender) {
        this._requestSender = _requestSender;
    }
    ConfigRequestSender.prototype.loadConfig = function (_a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/checkout/configuration';
        return this._requestSender.get(url, { timeout: timeout });
    };
    return ConfigRequestSender;
}());
exports.default = ConfigRequestSender;
//# sourceMappingURL=config-request-sender.js.map