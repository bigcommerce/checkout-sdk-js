import { memoizeOne } from '@bigcommerce/memoize';

import { RequestError } from '../common/error/errors';
import { createSelector } from '../common/selector';

import StoreCreditState, { DEFAULT_STATE } from './store-credit-state';

export default interface StoreCreditSelector {
    getApplyError(): RequestError | undefined;
    isApplying(): boolean;
}

export type StoreCreditSelectorFactory = (state: StoreCreditState) => StoreCreditSelector;

export function createStoreCreditSelectorFactory(): StoreCreditSelectorFactory {
    const getApplyError = createSelector(
        (state: StoreCreditState) => state.errors.applyError,
        error => () => error
    );

    const isApplying = createSelector(
        (state: StoreCreditState) => !!state.statuses.isApplying,
        status => () => status
    );

    return memoizeOne((
        state: StoreCreditState = DEFAULT_STATE
    ): StoreCreditSelector => {
        return {
            getApplyError: getApplyError(state),
            isApplying: isApplying(state),
        };
    });
}
