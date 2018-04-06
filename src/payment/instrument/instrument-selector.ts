/**
 * @todo Convert this file into TypeScript properly
 */
export default class InstrumentSelector {
    constructor(
        private _instruments: any = {}
    ) {}

    /**
     * @return {Array<Instrument>}
     */
    getInstruments(): any[] {
        return this._instruments.data;
    }

    getInstrumentsMeta(): any {
        return this._instruments.meta;
    }

    getLoadError(): Error | undefined {
        return this._instruments.errors && this._instruments.errors.loadError;
    }

    getVaultError(): Error | undefined {
        return this._instruments.errors && this._instruments.errors.vaultError;
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

    isVaulting(): boolean {
        return !!(this._instruments.statuses && this._instruments.statuses.isVaulting);
    }

    isDeleting(instrumentId?: string): boolean {
        if (!this._instruments.statuses || (instrumentId && this._instruments.statuses.deletingInstrument !== instrumentId)) {
            return false;
        }

        return !!this._instruments.statuses.isDeleting;
    }
}
