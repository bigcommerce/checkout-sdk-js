"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InstrumentSelector = /** @class */ (function () {
    function InstrumentSelector(instruments) {
        if (instruments === void 0) { instruments = {}; }
        this._instruments = instruments.data;
        this._errors = instruments.errors;
        this._statuses = instruments.statuses;
    }
    /**
     * @return {Array<Instrument>}
     */
    InstrumentSelector.prototype.getInstruments = function () {
        return this._instruments;
    };
    /**
     * @return {?ErrorResponse}
     */
    InstrumentSelector.prototype.getLoadError = function () {
        return this._errors && this._errors.loadError;
    };
    /**
     * @return {?ErrorResponse}
     */
    InstrumentSelector.prototype.getVaultError = function () {
        return this._errors && this._errors.vaultError;
    };
    /**
     * @param {string} [instrumentId]
     * @return {?ErrorResponse}
     */
    InstrumentSelector.prototype.getDeleteError = function (instrumentId) {
        if (!this._errors || (instrumentId && this._errors.failedInstrument !== instrumentId)) {
            return;
        }
        return this._errors.deleteError;
    };
    /**
     * @return {boolean}
     */
    InstrumentSelector.prototype.isLoading = function () {
        return !!(this._statuses && this._statuses.isLoading);
    };
    /**
     * @return {boolean}
     */
    InstrumentSelector.prototype.isVaulting = function () {
        return !!(this._statuses && this._statuses.isVaulting);
    };
    /**
     * @param {string} [instrumentId]
     * @return {boolean}
     */
    InstrumentSelector.prototype.isDeleting = function (instrumentId) {
        if (!this._statuses || (instrumentId && this._statuses.deletingInstrument !== instrumentId)) {
            return false;
        }
        return !!this._statuses.isDeleting;
    };
    return InstrumentSelector;
}());
exports.default = InstrumentSelector;
//# sourceMappingURL=instrument-selector.js.map