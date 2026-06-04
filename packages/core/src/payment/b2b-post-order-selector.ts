import { memoizeOne } from '@bigcommerce/memoize';

import { createSelector } from '../common/selector';

import B2BPostOrderState, { DEFAULT_STATE } from './b2b-post-order-state';

export default interface B2BPostOrderSelector {
    getReceiptId(): string | undefined;
    getPersistError(): Error | undefined;
    isPersisting(): boolean;
}

export type B2BPostOrderSelectorFactory = (state: B2BPostOrderState) => B2BPostOrderSelector;

export function createB2BPostOrderSelectorFactory(): B2BPostOrderSelectorFactory {
    const getReceiptId = createSelector(
        (state: B2BPostOrderState) => state.data?.receiptId,
        (receiptId) => () => receiptId,
    );

    const getPersistError = createSelector(
        (state: B2BPostOrderState) => state.errors.persistError,
        (error) => () => error,
    );

    const isPersisting = createSelector(
        (state: B2BPostOrderState) => !!state.statuses.isPersisting,
        (status) => () => status,
    );

    return memoizeOne((state: B2BPostOrderState = DEFAULT_STATE): B2BPostOrderSelector => {
        return {
            getReceiptId: getReceiptId(state),
            getPersistError: getPersistError(state),
            isPersisting: isPersisting(state),
        };
    });
}
