export default interface PaymentStrategyState {
    errors: PaymentStrategyErrorsState;
    statuses: PaymentStrategyStatusesState;
}

export interface PaymentStrategyErrorsState {
    deinitializeError?: Error;
    deinitializeMethodId?: string;
    executeError?: Error;
    executeMethodId?: string;
    finalizeError?: Error;
    finalizeMethodId?: string;
    initializeError?: Error;
    initializeMethodId?: string;
    widgetInteractionError?: Error;
    widgetInteractionMethodId?: string;
}

export interface PaymentStrategyStatusesState {
    deinitializeMethodId?: string;
    executeMethodId?: string;
    finalizeMethodId?: string;
    initializeMethodId?: string;
    isDeinitializing?: boolean;
    isExecuting?: boolean;
    isFinalizing?: boolean;
    isInitializing?: boolean;
    isWidgetInteracting?: boolean;
    widgetInteractionMethodId?: string;
}

export const DEFAULT_STATE: PaymentStrategyState = {
    errors: {},
    statuses: {},
};
