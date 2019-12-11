import { memoizeOne } from '@bigcommerce/memoize';
import { filter, flatMap, isMatch, values } from 'lodash';

import { createSelector } from '../../common/selector';
import PaymentMethod from '../payment-method';

import PaymentInstrument, { CardInstrument } from './instrument';
import InstrumentState, { DEFAULT_STATE, InstrumentMeta } from './instrument-state';
import supportedInstruments from './supported-payment-instruments';

export default interface InstrumentSelector {
    getCardInstrument(instrumentId: string): CardInstrument | undefined;
    // TODO: Rename to `getCardInstruments`
    getInstruments(): CardInstrument[] | undefined;
    getInstrumentsByPaymentMethod(paymentMethod: PaymentMethod): PaymentInstrument[] | undefined;
    getInstrumentsMeta(): InstrumentMeta | undefined;
    getLoadError(): Error | undefined;
    getDeleteError(instrumentId?: string): Error | undefined;
    isLoading(): boolean ;
    isDeleting(instrumentId?: string): boolean;
}

export type InstrumentSelectorFactory = (state: InstrumentState) => InstrumentSelector;

export function createInstrumentSelectorFactory(): InstrumentSelectorFactory {
    const getInstrumentsByPaymentMethod = createSelector(
        (state: InstrumentState) => state.data,
        instruments => (paymentMethod: PaymentMethod) => {
            if (!instruments) {
                return;
            }

            const currentMethod = supportedInstruments[paymentMethod.id];

            if (!currentMethod) {
                return [];
            }

            return filter<PaymentInstrument>(instruments, currentMethod);
        }
    );

    const getCardInstrument = createSelector(
        (state: InstrumentState) => state.data,
        (instruments = []) => (instrumentId: string) => {
            const cards = values(supportedInstruments);

            return instruments.find((instrument): instrument is CardInstrument =>
                instrument.bigpayToken === instrumentId &&
                instrument.method === 'card' &&
                cards.some(card => isMatch(instrument, card))
            );
        }
    );

    const getInstruments = createSelector(
        (state: InstrumentState) => state.data,
        instruments => () => {
            if (!instruments) {
                return;
            }

            const cardInstruments = flatMap(supportedInstruments, card =>
                filter(instruments, (instrument: PaymentInstrument): instrument is CardInstrument => {
                    return card.method === 'card' && isMatch(instrument, card);
                })
            );

            return cardInstruments;
        }
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
            getCardInstrument: getCardInstrument(state),
            getInstruments: getInstruments(state),
            getInstrumentsByPaymentMethod: getInstrumentsByPaymentMethod(state),
            getInstrumentsMeta: getInstrumentsMeta(state),
            getLoadError: getLoadError(state),
            getDeleteError: getDeleteError(state),
            isLoading: isLoading(state),
            isDeleting: isDeleting(state),
        };
    });
}
