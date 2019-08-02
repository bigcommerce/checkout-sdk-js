import Cart from './cart';

export default interface CartState {
    data?: Cart;
    errors: CartErrorsState;
    statuses: CartStatusesState;
}

export interface CartErrorsState {
    loadError?: Error;
}

export interface CartStatusesState {
    isLoading?: boolean;
}

export const DEFAULT_STATE: CartState = {
    errors: {},
    statuses: {},
};
