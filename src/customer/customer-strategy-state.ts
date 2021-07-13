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
    deinitializeError?: Error;
    deinitializeMethodId?: string;
    initializeError?: Error;
    initializeMethodId?: string;
    signInError?: Error;
    signInMethodId?: string;
    signOutError?: Error;
    signOutMethodId?: string;
    customerContinueError?: Error;
    customerContinueMethodId?: string;
    widgetInteractionError?: Error;
    widgetInteractionMethodId?: string;
}

export interface CustomerStrategyStatusesState {
    customerContinueMethodId?: string;
    deinitializeMethodId?: string;
    initializeMethodId?: string;
    isCustomerContinuing?: boolean;
    isDeinitializing?: boolean;
    isInitializing?: boolean;
    isSigningIn?: boolean;
    isSigningOut?: boolean;
    signInMethodId?: string;
    signOutMethodId?: string;
    isWidgetInteracting?: boolean;
    widgetInteractionMethodId?: string;
}

export const DEFAULT_STATE: CustomerStrategyState = {
    data: {},
    errors: {},
    statuses: {},
};
