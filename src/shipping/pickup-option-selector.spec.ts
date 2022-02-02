import { CheckoutStoreState } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';

import PickupOptionSelector, { createPickupOptionSelectorFactory, PickupOptionSelectorFactory } from './pickup-option-selector';

describe('PickupOptionSelector', () => {
    let pickupOptionSelector: PickupOptionSelector;
    let createPickupOptionSelector: PickupOptionSelectorFactory;
    let state: CheckoutStoreState;

    beforeEach(() => {
        createPickupOptionSelector = createPickupOptionSelectorFactory();
        state = getCheckoutStoreState();
    });

    describe('#getPickupOptions()', () => {
        it('returns a list of pickup options', () => {
            pickupOptionSelector = createPickupOptionSelector(state.pickupOptions);

            expect(pickupOptionSelector.getPickupOptions()).toEqual(state.pickupOptions.data);
        });

        it('returns an empty array if there are no pickup options', () => {
            pickupOptionSelector = createPickupOptionSelector({
                ...state.pickupOptions,
                data: [],
            });

            expect(pickupOptionSelector.getPickupOptions()).toEqual([]);
        });
    });

    describe('#getLoadError()', () => {
        it('returns error if unable to load', () => {
            const loadError = new Error();

            pickupOptionSelector = createPickupOptionSelector({
                ...state.pickupOptions,
                errors: { loadError },
            });

            expect(pickupOptionSelector.getLoadError()).toEqual(loadError);
        });

        it('does not returns error if able to load', () => {
            pickupOptionSelector = createPickupOptionSelector(state.pickupOptions);

            expect(pickupOptionSelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading countries', () => {
            pickupOptionSelector = createPickupOptionSelector({
                ...state.pickupOptions,
                statuses: { isLoading: true },
            });

            expect(pickupOptionSelector.isLoading()).toEqual(true);
        });

        it('returns false if not loading countries', () => {
            pickupOptionSelector = createPickupOptionSelector(state.pickupOptions);

            expect(pickupOptionSelector.isLoading()).toEqual(false);
        });
    });
});
