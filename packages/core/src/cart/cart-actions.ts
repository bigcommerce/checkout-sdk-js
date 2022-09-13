import { Action } from '@bigcommerce/data-store';

import { Checkout } from '../checkout';

export enum CartActionType {
    CreateCartRequested = 'CREATE_CART_REQUESTED',
    CreateCartSucceeded = 'CREATE_CART_SUCCEEDED',
    CreateCartFailed = 'CREATE_CART_FAILED',
}

export type CartAction = CreateCartAction;

export type CreateCartAction =
    CreateCartRequestedAction |
    CreateCartSucceededAction |
    CreateCartFailedAction

export interface CreateCartRequestedAction extends Action {
    type: CartActionType.CreateCartRequested;
}

export interface CreateCartSucceededAction extends Action<Checkout> {
    type: CartActionType.CreateCartSucceeded;
}

export interface CreateCartFailedAction extends Action<Error> {
    type: CartActionType.CreateCartFailed;
}
