import { memoizeOne } from '@bigcommerce/memoize';

import { createSelector } from '../common/selector';

import CustomerStrategyState, { DEFAULT_STATE } from './customer-strategy-state';

export default interface CustomerStrategySelector {
    getSignInError(methodId?: string): Error | undefined;
    getSignOutError(methodId?: string): Error | undefined;
    getExecutePaymentMethodCheckoutError(methodId?: string): Error | undefined;
    getInitializeError(methodId?: string): Error | undefined;
    getWidgetInteractionError(methodId?: string): Error | undefined;
    isSigningIn(methodId?: string): boolean;
    isSigningOut(methodId?: string): boolean;
    isExecutingPaymentMethodCheckout(methodId?: string): boolean;
    isInitializing(methodId?: string): boolean;
    isInitialized(methodId: string): boolean;
    isFailed(methodId: string): boolean;
    isWidgetInteracting(methodId?: string): boolean;
}

export type CustomerStrategySelectorFactory = (
    state: CustomerStrategyState,
) => CustomerStrategySelector;

export function createCustomerStrategySelectorFactory(): CustomerStrategySelectorFactory {
    const getSignInError = createSelector(
        (state: CustomerStrategyState) => state.errors.signInMethodId,
        (state: CustomerStrategyState) => state.errors.signInError,
        (signInMethodId, signInError) => (methodId?: string) => {
            if (methodId && signInMethodId !== methodId) {
                return;
            }

            return signInError;
        },
    );

    const getSignOutError = createSelector(
        (state: CustomerStrategyState) => state.errors.signOutMethodId,
        (state: CustomerStrategyState) => state.errors.signOutError,
        (signOutMethodId, signOutError) => (methodId?: string) => {
            if (methodId && signOutMethodId !== methodId) {
                return;
            }

            return signOutError;
        },
    );

    const getExecutePaymentMethodCheckoutError = createSelector(
        (state: CustomerStrategyState) => state.errors.executePaymentMethodCheckoutMethodId,
        (state: CustomerStrategyState) => state.errors.executePaymentMethodCheckoutError,
        (executePaymentMethodCheckoutMethodId, executePaymentMethodCheckoutError) =>
            (methodId?: string) => {
                if (methodId && executePaymentMethodCheckoutMethodId !== methodId) {
                    return;
                }

                return executePaymentMethodCheckoutError;
            },
    );

    const getInitializeError = createSelector(
        (state: CustomerStrategyState) => state.errors.initializeMethodId,
        (state: CustomerStrategyState) => state.errors.initializeError,
        (initializeMethodId, initializeError) => (methodId?: string) => {
            if (methodId && initializeMethodId !== methodId) {
                return;
            }

            return initializeError;
        },
    );

    const getWidgetInteractionError = createSelector(
        (state: CustomerStrategyState) => state.errors.widgetInteractionMethodId,
        (state: CustomerStrategyState) => state.errors.widgetInteractionError,
        (widgetInteractionMethodId, widgetInteractionError) => (methodId?: string) => {
            if (methodId && widgetInteractionMethodId !== methodId) {
                return;
            }

            return widgetInteractionError;
        },
    );

    const isSigningIn = createSelector(
        (state: CustomerStrategyState) => state.statuses.signInMethodId,
        (state: CustomerStrategyState) => state.statuses.isSigningIn,
        (signInMethodId, isSigningIn) => (methodId?: string) => {
            if (methodId && signInMethodId !== methodId) {
                return false;
            }

            return !!isSigningIn;
        },
    );

    const isSigningOut = createSelector(
        (state: CustomerStrategyState) => state.statuses.signOutMethodId,
        (state: CustomerStrategyState) => state.statuses.isSigningOut,
        (signOutMethodId, isSigningOut) => (methodId?: string) => {
            if (methodId && signOutMethodId !== methodId) {
                return false;
            }

            return !!isSigningOut;
        },
    );

    const isExecutingPaymentMethodCheckout = createSelector(
        (state: CustomerStrategyState) => state.statuses.executePaymentMethodCheckoutMethodId,
        (state: CustomerStrategyState) => state.statuses.isExecutingPaymentMethodCheckout,
        (executePaymentMethodCheckoutMethodId, isExecutingPaymentMethodCheckout) =>
            (methodId?: string) => {
                if (methodId && executePaymentMethodCheckoutMethodId !== methodId) {
                    return false;
                }

                return !!isExecutingPaymentMethodCheckout;
            },
    );

    const isInitializing = createSelector(
        (state: CustomerStrategyState) => state.statuses.initializeMethodId,
        (state: CustomerStrategyState) => state.statuses.isInitializing,
        (initializeMethodId, isInitializing) => (methodId?: string) => {
            if (methodId && initializeMethodId !== methodId) {
                return false;
            }

            return !!isInitializing;
        },
    );

    const isInitialized = createSelector(
        (state: CustomerStrategyState) => state.data,
        (data) => (methodId: string) => {
            return !!(data[methodId] && data[methodId].isInitialized);
        },
    );

    const isWidgetInteracting = createSelector(
        (state: CustomerStrategyState) => state.statuses.widgetInteractionMethodId,
        (state: CustomerStrategyState) => state.statuses.isWidgetInteracting,
        (widgetInteractionMethodId, isWidgetInteracting) => (methodId?: string) => {
            if (methodId && widgetInteractionMethodId !== methodId) {
                return false;
            }

            return !!isWidgetInteracting;
        },
    );

    const isFailed = createSelector(
        (state: CustomerStrategyState) => state.errors,
        (errors) => (methodId: string) => {
            return errors.failedMethodIds?.includes(methodId) ?? false;
        },
    );

    return memoizeOne((state: CustomerStrategyState = DEFAULT_STATE): CustomerStrategySelector => {
        return {
            getSignInError: getSignInError(state),
            getSignOutError: getSignOutError(state),
            getExecutePaymentMethodCheckoutError: getExecutePaymentMethodCheckoutError(state),
            getInitializeError: getInitializeError(state),
            getWidgetInteractionError: getWidgetInteractionError(state),
            isSigningIn: isSigningIn(state),
            isSigningOut: isSigningOut(state),
            isExecutingPaymentMethodCheckout: isExecutingPaymentMethodCheckout(state),
            isInitializing: isInitializing(state),
            isInitialized: isInitialized(state),
            isFailed: isFailed(state),
            isWidgetInteracting: isWidgetInteracting(state),
        };
    });
}
