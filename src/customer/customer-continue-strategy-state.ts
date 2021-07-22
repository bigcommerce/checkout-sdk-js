export default interface CustomerContinueStrategyState {
    data: CustomerContinueStrategyDataState;
    errors: CustomerContinueStrategyErrorsState;
    statuses: CustomerContinueStrategyStatusesState;
}

export interface CustomerContinueStrategyDataState {
    [key: string]: {
        isInitialized: boolean;
    };
}

export interface CustomerContinueStrategyErrorsState {
    executeBeforeContinueAsGuestError?: Error;
    executeBeforeContinueAsGuestMethodId?: string;
    executeBeforeSignInError?: Error;
    executeBeforeSignInMethodId?: string;
    executeBeforeSignUpError?: Error;
    executeBeforeSignUpMethodId?: string;
    deinitializeError?: Error;
    deinitializeMethodId?: string;
    initializeError?: Error;
    initializeMethodId?: string;
}

export interface CustomerContinueStrategyStatusesState {
    executeBeforeContinueAsGuestMethodId?: string;
    executeBeforeSignInMethodId?: string;
    executeBeforeSignUpMethodId?: string;
    deinitializeMethodId?: string;
    initializeMethodId?: string;
    isDeinitializing?: boolean;
    isInitializing?: boolean;
    isExecutingBeforeContinueAsGuest?: boolean;
    isExecutingBeforeSignIn?: boolean;
    isExecutingBeforeSignUp?: boolean;
}

export const DEFAULT_STATE: CustomerContinueStrategyState = {
    data: {},
    errors: {},
    statuses: {},
};
