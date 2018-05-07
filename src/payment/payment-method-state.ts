import PaymentMethod from './payment-method';

export default interface PaymentMethodState {
    data?: PaymentMethod[];
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
