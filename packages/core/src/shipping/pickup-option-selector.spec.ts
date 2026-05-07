import { CheckoutStoreState } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';
import { objectFlatten, objectWithSortedKeys } from '../common/utility';

import PickupOptionSelector, {
    createPickupOptionSelectorFactory,
    PickupOptionSelectorFactory,
} from './pickup-option-selector';
import { getQueryForPickupOptions } from './pickup-option.mock';

import { PickupOptionRequestBody } from '.';

describe('PickupOptionSelector', () => {
    let pickupOptionSelector: PickupOptionSelector;
    let createPickupOptionSelector: PickupOptionSelectorFactory;
    let state: CheckoutStoreState;
    let query: PickupOptionRequestBody;

    beforeEach(() => {
        createPickupOptionSelector = createPickupOptionSelectorFactory();
        state = getCheckoutStoreState();
        query = getQueryForPickupOptions();
    });

    describe('#getPickupOptions()', () => {
        it.only('returns a list of pickup options', () => {
            pickupOptionSelector = createPickupOptionSelector(state.pickupOptions);

            const flattenedQuery = objectFlatten(query);
            const sortedFlattenedQuery = objectWithSortedKeys(flattenedQuery);
            const result =
                state.pickupOptions.data &&
                state.pickupOptions.data[btoa(JSON.stringify(sortedFlattenedQuery))];

            expect(
                pickupOptionSelector.getPickupOptions(query.consignmentId, query.searchArea),
            ).toEqual(result);
        });

        it('returns an empty array if there are no pickup options', () => {
            pickupOptionSelector = createPickupOptionSelector({
                ...state.pickupOptions,
                data: {},
            });

            expect(
                pickupOptionSelector.getPickupOptions(query.consignmentId, query.searchArea),
            ).toBeUndefined();
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

            expect(pickupOptionSelector.isLoading()).toBe(true);
        });

        it('returns false if not loading countries', () => {
            pickupOptionSelector = createPickupOptionSelector(state.pickupOptions);

            expect(pickupOptionSelector.isLoading()).toBe(false);
        });
    });
});
