import { memoizeOne } from '@bigcommerce/memoize';

import { createSelector } from '../common/selector';

import { Extension } from './extension';
import { DEFAULT_STATE, ExtensionState } from './extension-state';

export interface ExtensionSelector {
    getExtensions(): Extension[] | undefined;
    getLoadError(): Error | undefined;
    isLoading(): boolean;
}

export type ExtensionSelectorFactory = (state: ExtensionState) => ExtensionSelector;

export function createExtensionSelectorFactory(): ExtensionSelectorFactory {
    const getExtensions = createSelector(
        (state: ExtensionState) => state.data,
        (data) => () => data,
    );

    const getLoadError = createSelector(
        (state: ExtensionState) => state.errors.loadError,
        (error) => () => error,
    );

    const isLoading = createSelector(
        (state: ExtensionState) => state.statuses.isLoading,
        (isLoading) => () => !!isLoading,
    );

    return memoizeOne((state: ExtensionState = DEFAULT_STATE): ExtensionSelector => {
        return {
            getExtensions: getExtensions(state),
            getLoadError: getLoadError(state),
            isLoading: isLoading(state),
        };
    });
}
