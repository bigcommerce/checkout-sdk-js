import { find, set } from 'lodash';

import { CheckoutStoreState } from '../../checkout';
import { getCheckoutStoreState } from '../../checkout/checkouts.mock';
import { getBraintree } from '../payment-methods.mock';

import InstrumentSelector, { createInstrumentSelectorFactory, InstrumentSelectorFactory } from './instrument-selector';
import { getInstruments, getInstrumentsMeta } from './instrument.mock';

describe('InstrumentSelector', () => {
    let createInstrumentSelector: InstrumentSelectorFactory;
    let instrumentSelector: InstrumentSelector;
    let state: CheckoutStoreState;

    beforeEach(() => {
        createInstrumentSelector = createInstrumentSelectorFactory();
        state = getCheckoutStoreState();
    });

    describe('#getInstruments()', () => {
        it('returns only card instruments if no method is passed', () => {
            instrumentSelector = createInstrumentSelector(state.instruments);

            expect(instrumentSelector.getInstruments())
                .not.toContainEqual(expect.objectContaining({ externalId: expect.any(String) }));
        });

        it('returns only supported instruments if no method is passed', () => {
            set(state, 'instruments.data[0].provider', 'invalid');
            set(state, 'instruments.data[0].method', 'card');

            instrumentSelector = createInstrumentSelector(state.instruments);
            const result = instrumentSelector.getInstruments();

            expect(result).toContainEqual(expect.objectContaining({ provider: 'authorizenet', last4: expect.any(String) }));
            expect(result).not.toContainEqual(expect.objectContaining({ provider: 'invalid' }));
        });

        it('returns an empty array if there are no instruments', () => {
            instrumentSelector = createInstrumentSelector({ data: [], errors: {}, statuses: {} });

            expect(instrumentSelector.getInstruments()).toEqual([]);
        });
    });

    describe('#getInstrument()', () => {
        it('returns instrument with given ID', () => {
            instrumentSelector = createInstrumentSelector(state.instruments);

            expect(instrumentSelector.getCardInstrument('123'))
                .toEqual(find(getInstruments(), { bigpayToken: '123' }));
        });

        it('returns nothing if instrument is not found', () => {
            instrumentSelector = createInstrumentSelector(state.instruments);

            expect(instrumentSelector.getCardInstrument('1123123312'))
                .toBeUndefined();
        });

        it('only returns card instrument', () => {
            instrumentSelector = createInstrumentSelector(state.instruments);

            // tslint:disable-next-line:no-non-null-assertion
            expect(instrumentSelector.getCardInstrument(find(getInstruments(), { method: 'paypal' })!.bigpayToken))
                .toBeUndefined();
        });
    });

    describe('#getInstrumentsByPaymentMethod()', () => {
        it('returns the instruments for a particular method', () => {
            instrumentSelector = createInstrumentSelector(state.instruments);

            expect(instrumentSelector.getInstrumentsByPaymentMethod(getBraintree()))
                .toEqual([ expect.objectContaining({ provider: 'braintree', method: 'card' }) ]);
        });

        it('returns an empty array if the method is not supported', () => {
            instrumentSelector = createInstrumentSelector(state.instruments);

            expect(instrumentSelector.getInstrumentsByPaymentMethod({ ...getBraintree(), id: 'nonexistent' }))
                .toEqual([]);
        });

        it('returns an empty array if there are no instruments', () => {
            instrumentSelector = createInstrumentSelector({ data: [], errors: {}, statuses: {} });

            expect(instrumentSelector.getInstrumentsByPaymentMethod(getBraintree())).toEqual([]);
        });
    });

    describe('#getInstrumentsMeta()', () => {
        it('returns instrument meta', () => {
            instrumentSelector = createInstrumentSelector(state.instruments);

            expect(instrumentSelector.getInstrumentsMeta()).toEqual(getInstrumentsMeta());
        });

        it('returns same instrument meta unless state changes', () => {
            instrumentSelector = createInstrumentSelector(state.instruments);

            const meta = instrumentSelector.getInstrumentsMeta();

            instrumentSelector = createInstrumentSelector(state.instruments);

            expect(instrumentSelector.getInstrumentsMeta()).toBe(meta);

            instrumentSelector = createInstrumentSelector({
                ...state.instruments,
                meta: {
                    vaultAccessToken: '321efg',
                    vaultAccessExpiry: 1516097730499,
                },
            });

            expect(instrumentSelector.getInstrumentsMeta()).not.toBe(meta);
        });
    });

    describe('#getLoadError()', () => {
        it('returns error if unable to load', () => {
            const loadError = new Error();

            instrumentSelector = createInstrumentSelector({
                ...state.instruments,
                errors: { loadError },
            });

            expect(instrumentSelector.getLoadError()).toEqual(loadError);
        });

        it('does not return error if able to load', () => {
            instrumentSelector = createInstrumentSelector(state.instruments);

            expect(instrumentSelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#getDeleteError()', () => {
        const mockInstrumentId = '123';

        it('returns error if unable to delete', () => {
            const deleteError = new Error();

            instrumentSelector = createInstrumentSelector({
                ...state.instruments,
                errors: { deleteError, failedInstrument: mockInstrumentId },
            });

            expect(instrumentSelector.getDeleteError(mockInstrumentId)).toEqual(deleteError);
        });

        it('does not return error if able to delete', () => {
            instrumentSelector = createInstrumentSelector(state.instruments);

            expect(instrumentSelector.getDeleteError(mockInstrumentId)).toBeUndefined();
        });

        it('does not return error if unable to delete irrelevant instrument', () => {
            const deleteError = new Error();

            instrumentSelector = createInstrumentSelector({
                ...state.instruments,
                errors: { deleteError, failedInstrument: mockInstrumentId },
            });

            expect(instrumentSelector.getDeleteError('321')).toBeUndefined();
        });

        it('returns any error if instrument id is not passed', () => {
            const deleteError = new Error();

            instrumentSelector = createInstrumentSelector({
                ...state.instruments,
                errors: { deleteError, failedInstrument: mockInstrumentId },
            });

            expect(instrumentSelector.getDeleteError()).toEqual(deleteError);
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading instruments', () => {
            instrumentSelector = createInstrumentSelector({
                ...state.instruments,
                statuses: { isLoading: true },
            });

            expect(instrumentSelector.isLoading()).toEqual(true);
        });

        it('returns false if not loading instruments', () => {
            instrumentSelector = createInstrumentSelector(state.instruments);

            expect(instrumentSelector.isLoading()).toEqual(false);
        });
    });

    describe('#isDeleting()', () => {
        const mockInstrumentId = '123';

        it('returns true if deleting an instrument', () => {
            instrumentSelector = createInstrumentSelector({
                ...state.instruments,
                statuses: { isDeleting: true, deletingInstrument: mockInstrumentId },
            });

            expect(instrumentSelector.isDeleting(mockInstrumentId)).toEqual(true);
        });

        it('returns false if not deleting an instrument', () => {
            instrumentSelector = createInstrumentSelector({
                ...state.instruments,
                statuses: { isDeleting: false, deletingInstrument: undefined },
            });

            expect(instrumentSelector.isDeleting(mockInstrumentId)).toEqual(false);
        });

        it('returns false if not deleting specific instrument', () => {
            instrumentSelector = createInstrumentSelector({
                ...state.instruments,
                statuses: { isDeleting: true, deletingInstrument: '321' },
            });

            expect(instrumentSelector.isDeleting(mockInstrumentId)).toEqual(false);
        });

        it('returns any deleting status if instrument id is not passed', () => {
            instrumentSelector = createInstrumentSelector({
                ...state.instruments,
                statuses: { isDeleting: true, deletingInstrument: mockInstrumentId },
            });

            expect(instrumentSelector.isDeleting()).toEqual(true);
        });
    });
});
