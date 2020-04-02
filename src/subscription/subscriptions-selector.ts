import { memoizeOne } from '@bigcommerce/memoize';

import { createSelector } from '../common/selector';

import SubscriptionsState, { DEFAULT_STATE } from './subscriptions-state';

export default interface SubscriptionsSelector {
    getUpdateError(): Error | undefined;
    isUpdating(): boolean;
}

export type SubscriptionsSelectorFactory = (state: SubscriptionsState) => SubscriptionsSelector;

export function createSubscriptionsSelectorFactory(): SubscriptionsSelectorFactory {
    const getUpdateError = createSelector(
        (state: SubscriptionsState) => state.errors.updateError,
        error => () => error
    );

    const isUpdating = createSelector(
        (state: SubscriptionsState) => !!state.statuses.isUpdating,
        status => () => status
    );

    return memoizeOne((
        state: SubscriptionsState = DEFAULT_STATE
    ): SubscriptionsSelector => {
        return {
            getUpdateError: getUpdateError(state),
            isUpdating: isUpdating(state),
        };
    });
}
