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
    signUpError?: Error;
    signUpMethodId?: string;
    continueAsGuestError?: Error;
    continueAsGuestMethodId?: string;
    widgetInteractionError?: Error;
    widgetInteractionMethodId?: string;
}

export interface CustomerStrategyStatusesState {
    continueAsGuestMethodId?: string;
    deinitializeMethodId?: string;
    initializeMethodId?: string;
    isContinuingAsGuest?: boolean;
    isDeinitializing?: boolean;
    isInitializing?: boolean;
    isSigningIn?: boolean;
    isSigningOut?: boolean;
    isSigningUp?: boolean;
    signInMethodId?: string;
    signOutMethodId?: string;
    signUpMethodId?: string;
    isWidgetInteracting?: boolean;
    widgetInteractionMethodId?: string;
}

export const DEFAULT_STATE: CustomerStrategyState = {
    data: {},
    errors: {},
    statuses: {},
};
