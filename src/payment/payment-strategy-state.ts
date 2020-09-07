export default interface PaymentStrategyState {
    data: PaymentStrategyDataState;
    errors: PaymentStrategyErrorsState;
    statuses: PaymentStrategyStatusesState;
}

export interface PaymentStrategyDataState {
    [key: string]: {
        isInitialized: boolean;
    };
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
    isEmbeddedSubmitButton?: boolean;
    embeddedSubmitButtonMethodId?: string;
}

export const DEFAULT_STATE: PaymentStrategyState = {
    data: {},
    errors: {},
    statuses: {},
};
