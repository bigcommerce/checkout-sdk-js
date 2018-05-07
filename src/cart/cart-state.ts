import Cart from './cart';
import InternalCart from './internal-cart';

export default interface CartState {
    data?: InternalCart;
    externalData?: Cart;
    meta: CartMetaState;
    errors: CartErrorsState;
    statuses: CartStatusesState;
}

export interface CartMetaState {
    isValid?: boolean;
}

export interface CartErrorsState {
    loadError?: Error;
    verifyError?: Error;
}

export interface CartStatusesState {
    isLoading?: boolean;
    isVerifying?: boolean;
}
