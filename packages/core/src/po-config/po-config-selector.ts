import { memoizeOne } from '@bigcommerce/memoize';

import { createSelector } from '../common/selector';

import PoConfigState, { DEFAULT_STATE, PoConfig } from './po-config-state';

export default interface PoConfigSelector {
    getConfig(): PoConfig | undefined;
    getLoadError(): Error | undefined;
    isLoading(): boolean;
}

export type PoConfigSelectorFactory = (state: PoConfigState) => PoConfigSelector;

export function createPoConfigSelectorFactory(): PoConfigSelectorFactory {
    const getConfig = createSelector(
        (state: PoConfigState) => state.data,
        (data) => () => data,
    );

    const getLoadError = createSelector(
        (state: PoConfigState) => state.errors.loadError,
        (error) => () => error,
    );

    const isLoading = createSelector(
        (state: PoConfigState) => !!state.statuses.isLoading,
        (status) => () => status,
    );

    return memoizeOne((state: PoConfigState = DEFAULT_STATE): PoConfigSelector => {
        return {
            getConfig: getConfig(state),
            getLoadError: getLoadError(state),
            isLoading: isLoading(state),
        };
    });
}
