import { createSelector } from '../common/selector';
import { memoizeOne } from '../common/utility';

import Config, { ContextConfig, StoreConfig } from './config';
import ConfigState, { DEFAULT_STATE } from './config-state';

export default interface ConfigSelector {
    getConfig(): Config | undefined;
    getStoreConfig(): StoreConfig | undefined;
    getContextConfig(): ContextConfig | undefined;
    getExternalSource(): string | undefined;
    getLoadError(): Error | undefined;
    isLoading(): boolean;
}

export type ConfigSelectorFactory = (state: ConfigState) => ConfigSelector;

export function createConfigSelectorFactory(): ConfigSelectorFactory {

    const getConfig = createSelector(
        (state: ConfigState) => state.data,
        data => () => data
    );

    const getStoreConfig = createSelector(
        (state: ConfigState) => state.data && state.data.storeConfig,
        data => () => data
    );

    const getContextConfig = createSelector(
        (state: ConfigState) => state.data && state.data.context,
        data => () => data
    );

    const getExternalSource = createSelector(
        (state: ConfigState) => state.meta && state.meta.externalSource,
        data => () => data
    );

    const getLoadError = createSelector(
        (state: ConfigState) => state.errors.loadError,
        error => () => error
    );

    const isLoading = createSelector(
        (state: ConfigState) => !!state.statuses.isLoading,
        status => () => status
    );

    return memoizeOne((
        state: ConfigState = DEFAULT_STATE
    ): ConfigSelector => {
        return {
            getConfig: getConfig(state),
            getStoreConfig: getStoreConfig(state),
            getContextConfig: getContextConfig(state),
            getExternalSource: getExternalSource(state),
            getLoadError: getLoadError(state),
            isLoading: isLoading(state),
        };
    });
}
