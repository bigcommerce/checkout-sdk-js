import { memoizeOne } from '@bigcommerce/memoize';

import { createSelector } from '../common/selector';
import { objectFlatten, objectWithSortedKeys } from '../common/utility';

import { PickupOptionResult, SearchArea } from './pickup-option';
import PickupOptionState, { DEFAULT_STATE } from './pickup-option-state';

export default interface PickupOptionSelector {
    getPickupOptions(
        consignmentId: string,
        searchArea: SearchArea,
    ): PickupOptionResult[] | undefined;
    getLoadError(): Error | undefined;
    isLoading(): boolean;
}

export type PickupOptionSelectorFactory = (state: PickupOptionState) => PickupOptionSelector;

export function createPickupOptionSelectorFactory(): PickupOptionSelectorFactory {
    const getPickupOptions = createSelector(
        (state: PickupOptionState) => state.data,
        (pickupOptions) => (consignmentId: string, searchArea: SearchArea) => {
            if (!pickupOptions) {
                return;
            }

            const flattenedParams = objectFlatten({ consignmentId, searchArea });
            const sortedFlattenedParams = objectWithSortedKeys(flattenedParams);
            const keyString = btoa(`${JSON.stringify(sortedFlattenedParams)}`);

            return pickupOptions[keyString];
        },
    );

    const getLoadError = createSelector(
        (state: PickupOptionState) => state.errors.loadError,
        (error) => () => error,
    );

    const isLoading = createSelector(
        (state: PickupOptionState) => !!state.statuses.isLoading,
        (status) => () => status,
    );

    return memoizeOne((state: PickupOptionState = DEFAULT_STATE): PickupOptionSelector => {
        return {
            getPickupOptions: getPickupOptions(state),
            getLoadError: getLoadError(state),
            isLoading: isLoading(state),
        };
    });
}
