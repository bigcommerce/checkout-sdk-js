import Checkout from './checkout';

export default interface CheckoutState {
    data?: Checkout;
    errors: CheckoutErrorsState;
    statuses: CheckoutStatusesState;
}

export interface CheckoutErrorsState {
    loadError?: Error;
}

export interface CheckoutStatusesState {
    isLoading?: boolean;
}
