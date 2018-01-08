"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InstrumentSelector = (function () {
    function InstrumentSelector(instruments) {
        if (instruments === void 0) { instruments = {}; }
        this._instruments = instruments;
    }
    InstrumentSelector.prototype.getInstruments = function () {
        return this._instruments.data;
    };
    InstrumentSelector.prototype.getLoadError = function () {
        return this._instruments.errors && this._instruments.errors.loadError;
    };
    InstrumentSelector.prototype.getVaultError = function () {
        return this._instruments.errors && this._instruments.errors.vaultError;
    };
    InstrumentSelector.prototype.getDeleteError = function (instrumentId) {
        if (!this._instruments.errors || (instrumentId && this._instruments.errors.failedInstrument !== instrumentId)) {
            return;
        }
        return this._instruments.errors.deleteError;
    };
    InstrumentSelector.prototype.isLoading = function () {
        return !!(this._instruments.statuses && this._instruments.statuses.isLoading);
    };
    InstrumentSelector.prototype.isVaulting = function () {
        return !!(this._instruments.statuses && this._instruments.statuses.isVaulting);
    };
    InstrumentSelector.prototype.isDeleting = function (instrumentId) {
        if (!this._instruments.statuses || (instrumentId && this._instruments.statuses.deletingInstrument !== instrumentId)) {
            return false;
        }
        return !!this._instruments.statuses.isDeleting;
    };
    return InstrumentSelector;
}());
exports.default = InstrumentSelector;
//# sourceMappingURL=instrument-selector.js.map