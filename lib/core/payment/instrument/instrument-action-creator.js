"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var data_store_1 = require("../../../data-store");
var actionTypes = require("./instrument-action-types");
var InstrumentActionCreator = (function () {
    function InstrumentActionCreator(instrumentRequestSender) {
        this._instrumentRequestSender = instrumentRequestSender;
    }
    InstrumentActionCreator.prototype.loadInstruments = function (storeId, shopperId) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.LOAD_INSTRUMENTS_REQUESTED));
            _this._instrumentRequestSender.getShopperToken(storeId, shopperId)
                .then(function (_a) {
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                return _this._instrumentRequestSender.getInstruments(storeId, shopperId, data.token);
            })
                .then(function (_a) {
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                observer.next(data_store_1.createAction(actionTypes.LOAD_INSTRUMENTS_SUCCEEDED, data));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.LOAD_INSTRUMENTS_FAILED, response));
            });
        });
    };
    InstrumentActionCreator.prototype.vaultInstrument = function (storeId, shopperId, instrument) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.VAULT_INSTRUMENT_REQUESTED));
            _this._instrumentRequestSender.getShopperToken(storeId, shopperId)
                .then(function (_a) {
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                return _this._instrumentRequestSender.vaultInstrument(storeId, shopperId, data.token, instrument);
            })
                .then(function (_a) {
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                observer.next(data_store_1.createAction(actionTypes.VAULT_INSTRUMENT_SUCCEEDED, data));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.VAULT_INSTRUMENT_FAILED, response));
            });
        });
    };
    InstrumentActionCreator.prototype.deleteInstrument = function (storeId, shopperId, instrumentId) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.DELETE_INSTRUMENT_REQUESTED, undefined, { instrumentId: instrumentId }));
            _this._instrumentRequestSender.getShopperToken(storeId, shopperId)
                .then(function (_a) {
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                return _this._instrumentRequestSender.deleteInstrument(storeId, shopperId, instrumentId, data.token);
            })
                .then(function () {
                observer.next(data_store_1.createAction(actionTypes.DELETE_INSTRUMENT_SUCCEEDED, undefined, { instrumentId: instrumentId }));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.DELETE_INSTRUMENT_FAILED, response, { instrumentId: instrumentId }));
            });
        });
    };
    return InstrumentActionCreator;
}());
exports.default = InstrumentActionCreator;
//# sourceMappingURL=instrument-action-creator.js.map