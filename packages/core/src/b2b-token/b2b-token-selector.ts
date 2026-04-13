import { memoizeOne } from '@bigcommerce/memoize';

import { createSelector } from '../common/selector';

import B2BTokenState, { DEFAULT_STATE } from './b2b-token-state';

export default interface B2BTokenSelector {
    getToken(): string | undefined;
    getLoadError(): Error | undefined;
    isLoading(): boolean;
}

export type B2BTokenSelectorFactory = (state: B2BTokenState) => B2BTokenSelector;

export function createB2BTokenSelectorFactory(): B2BTokenSelectorFactory {
    const getToken = createSelector(
        (state: B2BTokenState) => state.data?.token,
        (token) => () => token,
    );

    const getLoadError = createSelector(
        (state: B2BTokenState) => state.errors.loadError,
        (error) => () => error,
    );

    const isLoading = createSelector(
        (state: B2BTokenState) => !!state.statuses.isLoading,
        (status) => () => status,
    );

    return memoizeOne((state: B2BTokenState = DEFAULT_STATE): B2BTokenSelector => {
        return {
            getToken: getToken(state),
            getLoadError: getLoadError(state),
            isLoading: isLoading(state),
        };
    });
}
