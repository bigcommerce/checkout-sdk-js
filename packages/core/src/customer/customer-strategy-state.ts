export default interface CustomerStrategyState {
    data: CustomerStrategyDataState;
    errors: CustomerStrategyErrorsState;
    statuses: CustomerStrategyStatusesState;
}

export interface CustomerStrategyDataState {
    [key: string]: {
        isInitialized: boolean;
    };
}

export interface CustomerStrategyErrorsState {
    failedMethodIds?: string[];
    deinitializeError?: Error;
    deinitializeMethodId?: string;
    initializeError?: Error;
    initializeMethodId?: string;
    signInError?: Error;
    signInMethodId?: string;
    signOutError?: Error;
    signOutMethodId?: string;
    executePaymentMethodCheckoutError?: Error;
    executePaymentMethodCheckoutMethodId?: string;
    widgetInteractionError?: Error;
    widgetInteractionMethodId?: string;
}

export interface CustomerStrategyStatusesState {
    deinitializeMethodId?: string;
    initializeMethodId?: string;
    isDeinitializing?: boolean;
    isInitializing?: boolean;
    isSigningIn?: boolean;
    isSigningOut?: boolean;
    signInMethodId?: string;
    signOutMethodId?: string;
    isExecutingPaymentMethodCheckout?: boolean;
    executePaymentMethodCheckoutMethodId?: string;
    isWidgetInteracting?: boolean;
    widgetInteractionMethodId?: string;
}

export const DEFAULT_STATE: CustomerStrategyState = {
    data: {},
    errors: {},
    statuses: {},
};
