import { CheckoutButtonMethodType } from './strategies';

export default interface CheckoutButtonState {
    data: Partial<Record<CheckoutButtonMethodType, CheckoutButtonDataState | undefined>>;
    errors: Partial<Record<CheckoutButtonMethodType, CheckoutButtonErrorsState | undefined>>;
    statuses: Partial<Record<CheckoutButtonMethodType, CheckoutButtonStatusesState | undefined>>;
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
