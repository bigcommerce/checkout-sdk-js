import B2BCompanyPaymentMethod from './b2b-company-payment-method';

export default interface B2BCompanyPaymentMethodState {
    data?: B2BCompanyPaymentMethod[];
    errors: B2BCompanyPaymentMethodErrorsState;
    statuses: B2BCompanyPaymentMethodStatusesState;
}

export interface B2BCompanyPaymentMethodErrorsState {
    loadError?: Error;
}

export interface B2BCompanyPaymentMethodStatusesState {
    isLoading?: boolean;
}

export const DEFAULT_STATE: B2BCompanyPaymentMethodState = {
    errors: {},
    statuses: {},
};
