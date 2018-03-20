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
}
