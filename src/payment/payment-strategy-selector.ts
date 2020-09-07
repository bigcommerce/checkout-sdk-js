import { memoizeOne } from '@bigcommerce/memoize';

import { createSelector } from '../common/selector';

import PaymentStrategyState, { DEFAULT_STATE } from './payment-strategy-state';

export default interface PaymentStrategySelector {
    getInitializeError(methodId?: string): Error | undefined;
    getExecuteError(methodId?: string): Error | undefined;
    getFinalizeError(methodId?: string): Error | undefined;
    getWidgetInteractingError(methodId?: string): Error | undefined;
    isInitializing(methodId?: string): boolean;
    isInitialized(methodId: string): boolean;
    isExecuting(methodId?: string): boolean;
    isFinalizing(methodId?: string): boolean;
    isWidgetInteracting(methodId?: string): boolean;
    isShowEmbeddedSubmitButton(methodId?: string): boolean;
}

export type PaymentStrategySelectorFactory = (state: PaymentStrategyState) => PaymentStrategySelector;

export function createPaymentStrategySelectorFactory(): PaymentStrategySelectorFactory {
    const getInitializeError = createSelector(
        (state: PaymentStrategyState) => state.errors.initializeMethodId,
        (state: PaymentStrategyState) => state.errors.initializeError,
        (initializeMethodId, initializeError) => (methodId?: string) => {
            if (methodId && initializeMethodId !== methodId) {
                return;
            }

            return initializeError;
        }
    );

    const getExecuteError = createSelector(
        (state: PaymentStrategyState) => state.errors.executeMethodId,
        (state: PaymentStrategyState) => state.errors.executeError,
        (executeMethodId, executeError) => (methodId?: string) => {
            if (methodId && executeMethodId !== methodId) {
                return;
            }

            return executeError;
        }
    );

    const getFinalizeError = createSelector(
        (state: PaymentStrategyState) => state.errors.finalizeMethodId,
        (state: PaymentStrategyState) => state.errors.finalizeError,
        (finalizeMethodId, finalizeError) => (methodId?: string) => {
            if (methodId && finalizeMethodId !== methodId) {
                return;
            }

            return finalizeError;
        }
    );

    const getWidgetInteractingError = createSelector(
        (state: PaymentStrategyState) => state.errors.widgetInteractionMethodId,
        (state: PaymentStrategyState) => state.errors.widgetInteractionError,
        (widgetInteractionMethodId, widgetInteractionError) => (methodId?: string) => {
            if (methodId && widgetInteractionMethodId !== methodId) {
                return;
            }

            return widgetInteractionError;
        }
    );

    const isInitializing = createSelector(
        (state: PaymentStrategyState) => state.statuses.initializeMethodId,
        (state: PaymentStrategyState) => state.statuses.isInitializing,
        (initializeMethodId, isInitializing) => (methodId?: string) => {
            if (methodId && initializeMethodId !== methodId) {
                return false;
            }

            return !!isInitializing;
        }
    );

    const isInitialized = createSelector(
        (state: PaymentStrategyState) => state.data,
        data => (methodId: string) => {
            return !!(
                data[methodId] &&
                data[methodId].isInitialized
            );
        }
    );

    const isExecuting = createSelector(
        (state: PaymentStrategyState) => state.statuses.executeMethodId,
        (state: PaymentStrategyState) => state.statuses.isExecuting,
        (executeMethodId, isExecuting) => (methodId?: string) => {
            if (methodId && executeMethodId !== methodId) {
                return false;
            }

            return !!isExecuting;
        }
    );

    const isFinalizing = createSelector(
        (state: PaymentStrategyState) => state.statuses.finalizeMethodId,
        (state: PaymentStrategyState) => state.statuses.isFinalizing,
        (finalizeMethodId, isFinalizing) => (methodId?: string) => {
            if (methodId && finalizeMethodId !== methodId) {
                return false;
            }

            return !!isFinalizing;
        }
    );

    const isWidgetInteracting = createSelector(
        (state: PaymentStrategyState) => state.statuses.widgetInteractionMethodId,
        (state: PaymentStrategyState) => state.statuses.isWidgetInteracting,
        (widgetInteractionMethodId, isWidgetInteracting) => (methodId?: string) => {
            if (methodId && widgetInteractionMethodId !== methodId) {
                return false;
            }

            return !!isWidgetInteracting;
        }
    );

    const isShowEmbeddedSubmitButton = createSelector(
        (state: PaymentStrategyState) => state.statuses.embeddedSubmitButtonMethodId,
        (state: PaymentStrategyState) => state.statuses.isEmbeddedSubmitButton,
        (embeddedSubmitButtonMethodId, isEmbeddedSubmitButton) => (methodId?: string) => {
            if (methodId && embeddedSubmitButtonMethodId !== methodId) {
                return false;
            }

            return !!isEmbeddedSubmitButton;
        }
    );

    return memoizeOne((
        state: PaymentStrategyState = DEFAULT_STATE
    ): PaymentStrategySelector => {
        return {
            getInitializeError: getInitializeError(state),
            getExecuteError: getExecuteError(state),
            getFinalizeError: getFinalizeError(state),
            getWidgetInteractingError: getWidgetInteractingError(state),
            isInitializing: isInitializing(state),
            isInitialized: isInitialized(state),
            isExecuting: isExecuting(state),
            isFinalizing: isFinalizing(state),
            isWidgetInteracting: isWidgetInteracting(state),
            isShowEmbeddedSubmitButton: isShowEmbeddedSubmitButton(state),
        };
    });
}
