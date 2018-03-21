export default interface CustomerStrategyState {
    errors: CustomerStrategyErrorsState;
    statuses: CustomerStrategyStatusesState;
}

export interface CustomerStrategyErrorsState {
    deinitializeError?: Error;
    deinitializeMethod?: string;
    initializeError?: Error;
    initializeMethod?: string;
    signInError?: Error;
    signInMethod?: string;
    signOutError?: Error;
    signOutMethod?: string;
}

export interface CustomerStrategyStatusesState {
    deinitializingMethod?: string;
    initializingMethod?: string;
    isDeinitializing?: boolean;
    isInitializing?: boolean;
    isSigningIn?: boolean;
    isSigningOut?: boolean;
    signingInMethod?: string;
    signingOutMethod?: string;
}
