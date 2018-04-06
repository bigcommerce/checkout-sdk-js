"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("../../../common/error/errors");
var SCRIPT_SRC = '//static.wepay.com/min/js/risk.1.latest.js';
var WepayRiskClient = (function () {
    function WepayRiskClient(_scriptLoader) {
        this._scriptLoader = _scriptLoader;
    }
    WepayRiskClient.prototype.initialize = function () {
        var _this = this;
        return this
            ._scriptLoader
            .loadScript(SCRIPT_SRC)
            .then(function () { return _this._riskClient = window.WePay.risk; })
            .then(function () { return _this; });
    };
    WepayRiskClient.prototype.getRiskToken = function () {
        if (!this._riskClient) {
            throw new errors_1.NotInitializedError();
        }
        this._riskClient.generate_risk_token();
        return this._riskClient.get_risk_token();
    };
    return WepayRiskClient;
}());
exports.default = WepayRiskClient;
//# sourceMappingURL=wepay-risk-client.js.map