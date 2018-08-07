export default interface CheckoutButtonState {
    errors: {
        [key: string]: CheckoutButtonErrorsState | undefined,
    };
    statuses: {
        [key: string]: CheckoutButtonStatusesState | undefined,
    };
}

export interface CheckoutButtonErrorsState {
    initializeError?: Error;
    deinitializeError?: Error;
}

export interface CheckoutButtonStatusesState {
    isInitializing?: boolean;
    isDeinitializing?: boolean;
}
