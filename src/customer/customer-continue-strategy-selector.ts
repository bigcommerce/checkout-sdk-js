import { memoizeOne } from '@bigcommerce/memoize';

import { createSelector } from '../common/selector';

import CustomerContinueStrategyState, { DEFAULT_STATE } from './customer-continue-strategy-state';

export default interface CustomerContinueStrategySelector {
    getExecuteBeforeContinueAsGuestError(methodId?: string): Error | undefined;
    getExecuteBeforeSignInError(methodId?: string): Error | undefined;
    getExecuteBeforeSignUpError(methodId?: string): Error | undefined;
    getInitializeError(methodId?: string): Error | undefined;
    isExecutingBeforeContinueAsGuest(methodId?: string): boolean;
    isExecutingBeforeSignIn(methodId?: string): boolean;
    isExecutingBeforeSignUp(methodId?: string): boolean;
    isInitializing(methodId?: string): boolean;
    isInitialized(methodId: string): boolean;
}

export type CustomerContinueStrategySelectorFactory = (state: CustomerContinueStrategyState) => CustomerContinueStrategySelector;

export function createCustomerContinueStrategySelectorFactory(): CustomerContinueStrategySelectorFactory {
    const getExecuteBeforeContinueAsGuestError = createSelector(
        (state: CustomerContinueStrategyState) => state.errors.executeBeforeContinueAsGuestMethodId,
        (state: CustomerContinueStrategyState) => state.errors.executeBeforeContinueAsGuestError,
        (executeBeforeContinueAsGuestMethodId, executeBeforeContinueAsGuestError) => (methodId?: string) => {
            if (methodId && executeBeforeContinueAsGuestMethodId !== methodId) {
                return;
            }

            return executeBeforeContinueAsGuestError;
        }
    );

    const getExecuteBeforeSignInError = createSelector(
        (state: CustomerContinueStrategyState) => state.errors.executeBeforeSignInMethodId,
        (state: CustomerContinueStrategyState) => state.errors.executeBeforeSignInError,
        (executeBeforeSignInMethodId, executeBeforeSignInError) => (methodId?: string) => {
            if (methodId && executeBeforeSignInMethodId !== methodId) {
                return;
            }

            return executeBeforeSignInError;
        }
    );

    const getExecuteBeforeSignUpError = createSelector(
        (state: CustomerContinueStrategyState) => state.errors.executeBeforeSignUpMethodId,
        (state: CustomerContinueStrategyState) => state.errors.executeBeforeSignUpError,
        (executeBeforeSignUpMethodId, executeBeforeSignUpError) => (methodId?: string) => {
            if (methodId && executeBeforeSignUpMethodId !== methodId) {
                return;
            }

            return executeBeforeSignUpError;
        }
    );

    const getInitializeError = createSelector(
        (state: CustomerContinueStrategyState) => state.errors.initializeMethodId,
        (state: CustomerContinueStrategyState) => state.errors.initializeError,
        (initializeMethodId, initializeError) => (methodId?: string) => {
            if (methodId && initializeMethodId !== methodId) {
                return;
            }

            return initializeError;
        }
    );

    const isExecutingBeforeContinueAsGuest = createSelector(
        (state: CustomerContinueStrategyState) => state.statuses.executeBeforeContinueAsGuestMethodId,
        (state: CustomerContinueStrategyState) => state.statuses.isExecutingBeforeContinueAsGuest,
        (executeBeforeContinueAsGuestMethodId, isExecutingBeforeContinueAsGuest) => (methodId?: string) => {
            if (methodId && executeBeforeContinueAsGuestMethodId !== methodId) {
                return false;
            }

            return !!isExecutingBeforeContinueAsGuest;
        }
    );

    const isExecutingBeforeSignIn = createSelector(
        (state: CustomerContinueStrategyState) => state.statuses.executeBeforeSignInMethodId,
        (state: CustomerContinueStrategyState) => state.statuses.isExecutingBeforeSignIn,
        (executeBeforeSignInMethodId, isExecutingBeforeSignIn) => (methodId?: string) => {
            if (methodId && executeBeforeSignInMethodId !== methodId) {
                return false;
            }

            return !!isExecutingBeforeSignIn;
        }
    );

    const isExecutingBeforeSignUp = createSelector(
        (state: CustomerContinueStrategyState) => state.statuses.executeBeforeSignUpMethodId,
        (state: CustomerContinueStrategyState) => state.statuses.isExecutingBeforeSignUp,
        (executeBeforeSignUpMethodId, isExecutingBeforeSignUp) => (methodId?: string) => {
            if (methodId && executeBeforeSignUpMethodId !== methodId) {
                return false;
            }

            return !!isExecutingBeforeSignUp;
        }
    );

    const isInitializing = createSelector(
        (state: CustomerContinueStrategyState) => state.statuses.initializeMethodId,
        (state: CustomerContinueStrategyState) => state.statuses.isInitializing,
        (initializeMethodId, isInitializing) => (methodId?: string) => {
            if (methodId && initializeMethodId !== methodId) {
                return false;
            }

            return !!isInitializing;
        }
    );

    const isInitialized = createSelector(
        (state: CustomerContinueStrategyState) => state.data,
        data => (methodId: string) => {
            return !!(
                data[methodId] &&
                data[methodId].isInitialized
            );
        }
    );

    return memoizeOne((
        state: CustomerContinueStrategyState = DEFAULT_STATE
    ): CustomerContinueStrategySelector => {
        return {
            getExecuteBeforeContinueAsGuestError: getExecuteBeforeContinueAsGuestError(state),
            getExecuteBeforeSignInError: getExecuteBeforeSignInError(state),
            getExecuteBeforeSignUpError: getExecuteBeforeSignUpError(state),
            getInitializeError: getInitializeError(state),
            isExecutingBeforeContinueAsGuest: isExecutingBeforeContinueAsGuest(state),
            isExecutingBeforeSignIn: isExecutingBeforeSignIn(state),
            isExecutingBeforeSignUp: isExecutingBeforeSignUp(state),
            isInitializing: isInitializing(state),
            isInitialized: isInitialized(state),
        };
    });
}
