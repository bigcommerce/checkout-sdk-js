export default interface CustomerStrategyState {
    errors: CustomerStrategyErrorsState;
    statuses: CustomerStrategyStatusesState;
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
}
