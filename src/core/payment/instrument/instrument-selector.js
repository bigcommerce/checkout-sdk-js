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
     * @return {boolean}
     */
    isLoading() {
        return !!(this._instruments.statuses && this._instruments.statuses.isLoading);
    }
}
