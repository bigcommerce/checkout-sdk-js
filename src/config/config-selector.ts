import { memoizeOne } from '@bigcommerce/memoize';

import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { createSelector } from '../common/selector';
import { guard } from '../common/utility';

import Config, { ContextConfig, FlashMessage, FlashMessageType, StoreConfig } from './config';
import ConfigState, { DEFAULT_STATE } from './config-state';

export default interface ConfigSelector {
    getConfig(): Config | undefined;
    getFlashMessages(type?: FlashMessageType): FlashMessage[] | undefined;
    getStoreConfig(): StoreConfig | undefined;
    getStoreConfigOrThrow(): StoreConfig;
    getContextConfig(): ContextConfig | undefined;
    getExternalSource(): string | undefined;
    getVariantIdentificationToken(): string | undefined;
    getLoadError(): Error | undefined;
    isLoading(): boolean;
}

export type ConfigSelectorFactory = (state: ConfigState) => ConfigSelector;

export function createConfigSelectorFactory(): ConfigSelectorFactory {

    const getConfig = createSelector(
        (state: ConfigState) => state.data,
        data => () => data
    );

    const getFlashMessages = createSelector(
        (state: ConfigState) => state.data,
        data => (filterType?: FlashMessageType) => {
            if (!data) {
                return;
            }

            const { flashMessages } = data.context;

            if (!flashMessages) {
                return;
            }

            return filterType !== undefined ?
                flashMessages.filter(({ type }) => filterType === type) :
                flashMessages;
        }
    );

    const getStoreConfig = createSelector(
        (state: ConfigState) => state.data && state.data.storeConfig,
        data => () => data
    );

    const getStoreConfigOrThrow = createSelector(
        getStoreConfig,
        getStoreConfig => () => {
          return guard(getStoreConfig(), () => new MissingDataError(MissingDataErrorType.MissingCheckoutConfig));
        }
    );

    const getContextConfig = createSelector(
        (state: ConfigState) => state.data && state.data.context,
        data => () => data
    );

    const getExternalSource = createSelector(
        (state: ConfigState) => state.meta && state.meta.externalSource,
        data => () => data
    );

    const getVariantIdentificationToken = createSelector(
        (state: ConfigState) => state.meta && state.meta.variantIdentificationToken,
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
            getFlashMessages: getFlashMessages(state),
            getStoreConfig: getStoreConfig(state),
            getStoreConfigOrThrow: getStoreConfigOrThrow(state),
            getContextConfig: getContextConfig(state),
            getExternalSource: getExternalSource(state),
            getVariantIdentificationToken: getVariantIdentificationToken(state),
            getLoadError: getLoadError(state),
            isLoading: isLoading(state),
        };
    });
}
