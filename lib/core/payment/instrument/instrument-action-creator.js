"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Observable_1 = require("rxjs/Observable");
var date_time_1 = require("../../common/date-time");
var data_store_1 = require("../../../data-store");
var actionTypes = require("./instrument-action-types");
var InstrumentActionCreator = (function () {
    function InstrumentActionCreator(instrumentRequestSender) {
        this._instrumentRequestSender = instrumentRequestSender;
    }
    InstrumentActionCreator.prototype.loadInstruments = function (storeId, shopperId, accessToken) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.LOAD_INSTRUMENTS_REQUESTED));
            _this._getValidAccessToken(accessToken)
                .then(function (currentToken) {
                return _this._instrumentRequestSender.getInstruments(storeId, shopperId, currentToken.vaultAccessToken)
                    .then(function (_a) {
                    var body = (_a === void 0 ? {} : _a).body;
                    observer.next(data_store_1.createAction(actionTypes.LOAD_INSTRUMENTS_SUCCEEDED, body, currentToken));
                    observer.complete();
                });
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.LOAD_INSTRUMENTS_FAILED, response));
            });
        });
    };
    InstrumentActionCreator.prototype.vaultInstrument = function (storeId, shopperId, accessToken, instrument) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.VAULT_INSTRUMENT_REQUESTED));
            _this._getValidAccessToken(accessToken)
                .then(function (currentToken) {
                return _this._instrumentRequestSender.vaultInstrument(storeId, shopperId, currentToken.vaultAccessToken, instrument)
                    .then(function (_a) {
                    var body = (_a === void 0 ? {} : _a).body;
                    observer.next(data_store_1.createAction(actionTypes.VAULT_INSTRUMENT_SUCCEEDED, body, currentToken));
                    observer.complete();
                });
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.VAULT_INSTRUMENT_FAILED, response));
            });
        });
    };
    InstrumentActionCreator.prototype.deleteInstrument = function (storeId, shopperId, accessToken, instrumentId) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.DELETE_INSTRUMENT_REQUESTED, undefined, { instrumentId: instrumentId }));
            _this._getValidAccessToken(accessToken)
                .then(function (currentToken) {
                return _this._instrumentRequestSender.deleteInstrument(storeId, shopperId, currentToken.vaultAccessToken, instrumentId)
                    .then(function () {
                    observer.next(data_store_1.createAction(actionTypes.DELETE_INSTRUMENT_SUCCEEDED, undefined, tslib_1.__assign({ instrumentId: instrumentId }, currentToken)));
                    observer.complete();
                });
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.DELETE_INSTRUMENT_FAILED, response, { instrumentId: instrumentId }));
            });
        });
    };
    InstrumentActionCreator.prototype._isValidVaultAccessToken = function (accessToken) {
        if (!accessToken || !accessToken.vaultAccessToken) {
            return false;
        }
        var expiryBuffer = 2;
        var expiry = date_time_1.addMinutes(new Date(accessToken.vaultAccessExpiry), expiryBuffer);
        return date_time_1.isFuture(expiry);
    };
    InstrumentActionCreator.prototype._getValidAccessToken = function (accessToken) {
        return this._isValidVaultAccessToken(accessToken)
            ? Promise.resolve(accessToken)
            : this._instrumentRequestSender.getVaultAccessToken()
                .then(function (_a) {
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                return ({
                    vaultAccessToken: data.token,
                    vaultAccessExpiry: data.expires_at,
                });
            });
    };
    return InstrumentActionCreator;
}());
exports.default = InstrumentActionCreator;
//# sourceMappingURL=instrument-action-creator.js.map