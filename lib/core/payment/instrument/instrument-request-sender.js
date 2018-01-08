"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InstrumentRequestSender = (function () {
    function InstrumentRequestSender(client) {
        this._client = client;
    }
    InstrumentRequestSender.prototype.getShopperToken = function (storeId, shopperId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var payload = { storeId: storeId, shopperId: shopperId };
            _this._client.getShopperToken(payload, function (error, response) {
                if (error) {
                    reject(_this._transformResponse(error));
                }
                else {
                    resolve(_this._transformResponse(response));
                }
            });
        });
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
    InstrumentRequestSender.prototype.vaultInstrument = function (storeId, shopperId, authToken, instrument) {
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
    InstrumentRequestSender.prototype.deleteInstrument = function (storeId, shopperId, authToken) {
        var _this = this;
        var payload = { storeId: storeId, shopperId: shopperId, authToken: authToken };
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