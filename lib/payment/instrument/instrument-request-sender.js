"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InstrumentRequestSender = (function () {
    function InstrumentRequestSender(client, requestSender) {
        this._client = client;
        this._requestSender = requestSender;
    }
    InstrumentRequestSender.prototype.getVaultAccessToken = function (_a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/checkout/payments/vault-access-token';
        return this._requestSender.get(url, { timeout: timeout });
    };
    InstrumentRequestSender.prototype.getInstruments = function (storeId, shopperId, authToken) {
        var _this = this;
        var payload = { storeId: storeId, shopperId: shopperId, authToken: authToken };
        return new Promise(function (resolve, reject) {
            _this._client.getShopperInstruments(payload, function (error, response) {
                if (error) {
                    reject(_this._transformResponse(error));
                }
                else {
                    resolve(_this._transformResponse(response));
                }
            });
        });
    };
    InstrumentRequestSender.prototype.vaultInstrument = function (storeId, shopperId, instrument, authToken) {
        var _this = this;
        var payload = {
            storeId: storeId,
            shopperId: shopperId,
            authToken: authToken,
            instrument: instrument,
        };
        return new Promise(function (resolve, reject) {
            _this._client.postShopperInstrument(payload, function (error, response) {
                if (error) {
                    reject(_this._transformResponse(error));
                }
                else {
                    resolve(_this._transformResponse(response));
                }
            });
        });
    };
    InstrumentRequestSender.prototype.deleteInstrument = function (storeId, shopperId, authToken, instrumentId) {
        var _this = this;
        var payload = { storeId: storeId, shopperId: shopperId, authToken: authToken, instrumentId: instrumentId };
        return new Promise(function (resolve, reject) {
            _this._client.deleteShopperInstrument(payload, function (error, response) {
                if (error) {
                    reject(_this._transformResponse(error));
                }
                else {
                    resolve(_this._transformResponse(response));
                }
            });
        });
    };
    InstrumentRequestSender.prototype._transformResponse = function (_a) {
        var body = _a.data, status = _a.status, statusText = _a.statusText;
        return {
            headers: {},
            body: body,
            status: status,
            statusText: statusText,
        };
    };
    return InstrumentRequestSender;
}());
exports.default = InstrumentRequestSender;
//# sourceMappingURL=instrument-request-sender.js.map