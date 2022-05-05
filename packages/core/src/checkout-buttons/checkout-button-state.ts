import { CheckoutButtonMethodType } from './strategies';

export default interface CheckoutButtonState {
    data: {
        [key in CheckoutButtonMethodType]?: CheckoutButtonDataState | undefined
    };
    errors: {
        [key in CheckoutButtonMethodType]?: CheckoutButtonErrorsState | undefined
    };
    statuses: {
        [key in CheckoutButtonMethodType]?: CheckoutButtonStatusesState | undefined
    };
}

export interface CheckoutButtonDataState {
    initializedContainers: {
        [key: string]: boolean;
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

export const DEFAULT_STATE: CheckoutButtonState = {
    data: {},
    errors: {},
    statuses: {},
};
