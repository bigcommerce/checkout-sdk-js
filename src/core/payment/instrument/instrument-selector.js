export default class InstrumentSelector {
    constructor(instruments = {}) {
        this._instruments = instruments.data;
        this._errors = instruments.errors;
        this._statuses = instruments.statuses;
    }

    /**
     * @return {Array<Instrument>}
     */
    getInstruments() {
        return this._instruments;
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadError() {
        return this._errors && this._errors.loadError;
    }

    /**
     * @return {?ErrorResponse}
     */
    getVaultError() {
        return this._errors && this._errors.vaultError;
    }

    /**
     * @param {string} [instrumentId]
     * @return {?ErrorResponse}
     */
    getDeleteError(instrumentId) {
        if (!this._errors || (instrumentId && this._errors.failedInstrument !== instrumentId)) {
            return;
        }

        return this._errors.deleteError;
    }

    /**
     * @return {boolean}
     */
    isLoading() {
        return !!(this._statuses && this._statuses.isLoading);
    }

    /**
     * @return {boolean}
     */
    isVaulting() {
        return !!(this._statuses && this._statuses.isVaulting);
    }

    /**
     * @param {string} [instrumentId]
     * @return {boolean}
     */
    isDeleting(instrumentId) {
        if (!this._statuses || (instrumentId && this._statuses.deletingInstrument !== instrumentId)) {
            return false;
        }

        return !!this._statuses.isDeleting;
    }
}
