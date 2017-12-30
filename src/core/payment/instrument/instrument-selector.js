export default class InstrumentSelector {
    constructor(instruments = {}) {
        this._instruments = instruments;
    }

    /**
     * @return {Array<Instrument>}
     */
    getInstruments() {
        return this._instruments.data;
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadError() {
        return this._instruments.errors && this._instruments.errors.loadError;
    }

    /**
     * @return {?ErrorResponse}
     */
    getVaultError() {
        return this._instruments.errors && this._instruments.errors.vaultError;
    }

    /**
     * @param {string} [instrumentId]
     * @return {?ErrorResponse}
     */
    getDeleteError(instrumentId) {
        if (!this._instruments.errors || (instrumentId && this._instruments.errors.failedInstrument !== instrumentId)) {
            return;
        }

        return this._instruments.errors.deleteError;
    }

    /**
     * @return {boolean}
     */
    isLoading() {
        return !!(this._instruments.statuses && this._instruments.statuses.isLoading);
    }

    /**
     * @return {boolean}
     */
    isVaulting() {
        return !!(this._instruments.statuses && this._instruments.statuses.isVaulting);
    }

    /**
     * @param {string} [instrumentId]
     * @return {boolean}
     */
    isDeleting(instrumentId) {
        if (!this._instruments.statuses || (instrumentId && this._instruments.statuses.deletingInstrument !== instrumentId)) {
            return false;
        }

        return !!this._instruments.statuses.isDeleting;
    }
}
