import Instrument from './instrument';
import InstrumentState, { DEFAULT_STATE, InstrumentMeta } from './instrument-state';

export default class InstrumentSelector {
    constructor(
        private _instruments: InstrumentState = DEFAULT_STATE
    ) {}

    getInstruments(): Instrument[] | undefined {
        return this._instruments.data;
    }

    getInstrumentsMeta(): InstrumentMeta | undefined {
        return this._instruments.meta;
    }

    getLoadError(): Error | undefined {
        return this._instruments.errors && this._instruments.errors.loadError;
    }

    getDeleteError(instrumentId?: string): Error | undefined {
        if (!this._instruments.errors || (instrumentId && this._instruments.errors.failedInstrument !== instrumentId)) {
            return;
        }

        return this._instruments.errors.deleteError;
    }

    isLoading(): boolean {
        return !!(this._instruments.statuses && this._instruments.statuses.isLoading);
    }

    isDeleting(instrumentId?: string): boolean {
        if (!this._instruments.statuses || (instrumentId && this._instruments.statuses.deletingInstrument !== instrumentId)) {
            return false;
        }

        return !!this._instruments.statuses.isDeleting;
    }
}
