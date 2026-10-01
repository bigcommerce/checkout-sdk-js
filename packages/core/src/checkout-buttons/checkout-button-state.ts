import { CheckoutButtonMethodType } from './strategies';

export default interface CheckoutButtonState {
    // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
    data: {
        [key in CheckoutButtonMethodType]?: CheckoutButtonDataState | undefined;
    };
    // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
    errors: {
        [key in CheckoutButtonMethodType]?: CheckoutButtonErrorsState | undefined;
    };
    // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
    statuses: {
        [key in CheckoutButtonMethodType]?: CheckoutButtonStatusesState | undefined;
    };
}

export interface CheckoutButtonDataState {
    initializedContainers: Record<string, boolean>;
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
