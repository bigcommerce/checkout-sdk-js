import { Action } from '@bigcommerce/data-store';

import Cart from './cart';

export enum CartActionType {
    LoadCartRequested = 'LOAD_CART_REQUESTED',
    LoadCartSucceeded = 'LOAD_CART_SUCCEEDED',
    LoadCartFailed = 'LOAD_CART_FAILED',
}

export type LoadCartAction =
    | LoadCartRequestedAction
    | LoadCartSucceededAction
    | LoadCartFailedAction;

export interface LoadCartRequestedAction extends Action {
    type: CartActionType.LoadCartRequested;
}

export interface LoadCartSucceededAction extends Action<Cart> {
    type: CartActionType.LoadCartSucceeded;
}

export interface LoadCartFailedAction extends Action<Error> {
    type: CartActionType.LoadCartFailed;
}
