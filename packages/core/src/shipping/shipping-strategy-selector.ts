import { memoizeOne } from '@bigcommerce/memoize';

import { createSelector } from '../common/selector';

import ShippingStrategyState, { DEFAULT_STATE } from './shipping-strategy-state';

export default interface ShippingStrategySelector {
    getUpdateAddressError(methodId?: string): Error | undefined;
    getSelectOptionError(methodId?: string): Error | undefined;
    getInitializeError(methodId?: string): Error | undefined;
    getWidgetInteractionError(methodId?: string): Error | undefined;
    isUpdatingAddress(methodId?: string): boolean;
    isSelectingOption(methodId?: string): boolean;
    isInitializing(methodId?: string): boolean;
    isInitialized(methodId: string): boolean;
    isWidgetInteracting(methodId?: string): boolean;
}

export type ShippingStrategySelectorFactory = (state: ShippingStrategyState) => ShippingStrategySelector;

export function createShippingStrategySelectorFactory(): ShippingStrategySelectorFactory {
    const getUpdateAddressError = createSelector(
        (state: ShippingStrategyState) => state.errors.updateAddressMethodId,
        (state: ShippingStrategyState) => state.errors.updateAddressError,
        (updateAddressMethodId, updateAddressError) => (methodId?: string) => {
            if (methodId && updateAddressMethodId !== methodId) {
                return;
            }

            return updateAddressError;
        }
    );

    const getSelectOptionError = createSelector(
        (state: ShippingStrategyState) => state.errors.selectOptionMethodId,
        (state: ShippingStrategyState) => state.errors.selectOptionError,
        (selectOptionMethodId, selectOptionError) => (methodId?: string) => {
            if (methodId && selectOptionMethodId !== methodId) {
                return;
            }

            return selectOptionError;
        }
    );

    const getInitializeError = createSelector(
        (state: ShippingStrategyState) => state.errors.initializeMethodId,
        (state: ShippingStrategyState) => state.errors.initializeError,
        (initializeMethodId, initializeError) => (methodId?: string) => {
            if (methodId && initializeMethodId !== methodId) {
                return;
            }

            return initializeError;
        }
    );

    const getWidgetInteractionError = createSelector(
        (state: ShippingStrategyState) => state.errors.widgetInteractionMethodId,
        (state: ShippingStrategyState) => state.errors.widgetInteractionError,
        (widgetInteractionMethodId, widgetInteractionError) => (methodId?: string) => {
            if (methodId && widgetInteractionMethodId !== methodId) {
                return;
            }

            return widgetInteractionError;
        }
    );

    const isUpdatingAddress = createSelector(
        (state: ShippingStrategyState) => state.statuses.updateAddressMethodId,
        (state: ShippingStrategyState) => state.statuses.isUpdatingAddress,
        (updateAddressMethodId, isUpdatingAddress) => (methodId?: string) => {
            if (methodId && updateAddressMethodId !== methodId) {
                return false;
            }

            return !!isUpdatingAddress;
        }
    );

    const isSelectingOption = createSelector(
        (state: ShippingStrategyState) => state.statuses.selectOptionMethodId,
        (state: ShippingStrategyState) => state.statuses.isSelectingOption,
        (selectOptionMethodId, isSelectingOption) => (methodId?: string) => {
            if (methodId && selectOptionMethodId !== methodId) {
                return false;
            }

            return !!isSelectingOption;
        }
    );

    const isInitializing = createSelector(
        (state: ShippingStrategyState) => state.statuses.initializeMethodId,
        (state: ShippingStrategyState) => state.statuses.isInitializing,
        (initializeMethodId, isInitializing) => (methodId?: string) => {
            if (methodId && initializeMethodId !== methodId) {
                return false;
            }

            return !!isInitializing;
        }
    );

    const isInitialized = createSelector(
        (state: ShippingStrategyState) => state.data,
        data => (methodId: string) => {
            return !!(
                data[methodId] &&
                data[methodId].isInitialized
            );
        }
    );

    const isWidgetInteracting = createSelector(
        (state: ShippingStrategyState) => state.statuses.widgetInteractionMethodId,
        (state: ShippingStrategyState) => state.statuses.isWidgetInteracting,
        (widgetInteractionMethodId, isWidgetInteracting) => (methodId?: string) => {
            if (methodId && widgetInteractionMethodId !== methodId) {
                return false;
            }

            return !!isWidgetInteracting;
        }
    );

    return memoizeOne((
        state: ShippingStrategyState = DEFAULT_STATE
    ): ShippingStrategySelector => {
        return {
            getUpdateAddressError: getUpdateAddressError(state),
            getSelectOptionError: getSelectOptionError(state),
            getInitializeError: getInitializeError(state),
            getWidgetInteractionError: getWidgetInteractionError(state),
            isUpdatingAddress: isUpdatingAddress(state),
            isSelectingOption: isSelectingOption(state),
            isInitializing: isInitializing(state),
            isInitialized: isInitialized(state),
            isWidgetInteracting: isWidgetInteracting(state),
        };
    });
}
