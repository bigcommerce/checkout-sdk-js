import PaymentMethod from './payment-method';
import PaymentMethodMeta from './payment-method-meta';

export default interface PaymentMethodState {
    data?: PaymentMethod[];
    meta?: PaymentMethodMeta;
    errors: PaymentMethodErrorsState;
    statuses: PaymentMethodStatusesState;
}

export interface PaymentMethodErrorsState {
    loadMethodId?: string;
    loadError?: Error;
    loadMethodError?: Error;
}

export interface PaymentMethodStatusesState {
    loadMethodId?: string;
    isLoading?: boolean;
    isLoadingMethod?: boolean;
}

export const DEFAULT_STATE: PaymentMethodState = {
    errors: {},
    statuses: {},
};
