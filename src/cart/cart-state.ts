import Cart from './cart';
import InternalCart from './internal-cart';

export default interface CartState {
    data?: InternalCart;
    externalData?: Cart;
    errors: CartErrorsState;
    statuses: CartStatusesState;
}

export interface CartErrorsState {
    loadError?: Error;
}

export interface CartStatusesState {
    isLoading?: boolean;
}
