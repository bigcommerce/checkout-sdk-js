import { createSelector } from '../../common/selector';
import { memoizeOne } from '../../common/utility';

import Instrument from './instrument';
import InstrumentState, { DEFAULT_STATE, InstrumentMeta } from './instrument-state';

export default interface InstrumentSelector {
    getInstruments(): Instrument[] | undefined;
    getInstrumentsMeta(): InstrumentMeta | undefined;
    getLoadError(): Error | undefined;
    getDeleteError(instrumentId?: string): Error | undefined;
    isLoading(): boolean ;
    isDeleting(instrumentId?: string): boolean;
}

export type InstrumentSelectorFactory = (state: InstrumentState) => InstrumentSelector;

export function createInstrumentSelectorFactory(): InstrumentSelectorFactory {
    const getInstruments = createSelector(
        (state: InstrumentState) => state.data,
        instruments => () => instruments
    );

    const getInstrumentsMeta = createSelector(
        (state: InstrumentState) => state.meta,
        meta => () => meta
    );

    const getLoadError = createSelector(
        (state: InstrumentState) => state.errors.loadError,
        loadError => () => loadError
    );

    const getDeleteError = createSelector(
        (state: InstrumentState) => state.errors.failedInstrument,
        (state: InstrumentState) => state.errors.deleteError,
        (failedInstrument, deleteError) => (instrumentId?: string) => {
            if (instrumentId && failedInstrument !== instrumentId) {
                return;
            }

            return deleteError;
        }
    );

    const isLoading = createSelector(
        (state: InstrumentState) => state.statuses.isLoading,
        isLoading => () => !!isLoading
    );

    const isDeleting = createSelector(
        (state: InstrumentState) => state.statuses.deletingInstrument,
        (state: InstrumentState) => state.statuses.isDeleting,
        (deletingInstrument, isDeleting) => (instrumentId?: string) => {
            if (instrumentId && deletingInstrument !== instrumentId) {
                return false;
            }

            return !!isDeleting;
        }
    );

    return memoizeOne((
        state: InstrumentState = DEFAULT_STATE
    ): InstrumentSelector => {
        return {
            getInstruments: getInstruments(state),
            getInstrumentsMeta: getInstrumentsMeta(state),
            getLoadError: getLoadError(state),
            getDeleteError: getDeleteError(state),
            isLoading: isLoading(state),
            isDeleting: isDeleting(state),
        };
    });
}
