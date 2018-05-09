import PaymentMethod from './payment-method';
import PaymentMethodsMeta from './payment-methods-meta';

export default interface PaymentMethodState {
    data?: PaymentMethod[];
    meta?: PaymentMethodsMeta;
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
