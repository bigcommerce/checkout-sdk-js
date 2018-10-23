import { CheckoutButtonMethodType } from './strategies';

export default interface CheckoutButtonState {
    errors: {
        [key in CheckoutButtonMethodType]?: CheckoutButtonErrorsState | undefined
    };
    statuses: {
        [key in CheckoutButtonMethodType]?: CheckoutButtonStatusesState | undefined
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
