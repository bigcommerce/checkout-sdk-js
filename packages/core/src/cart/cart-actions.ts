import { Action } from '@bigcommerce/data-store';

import { LoadCheckoutAction } from '../checkout';

export enum CartActionType {
    CreateBuyNowCartRequested = 'CREATE_BUY_NOW_CART_REQUESTED',
    CreateBuyNowCartSucceeded = 'CREATE_BUY_NOW_CART_SUCCEEDED',
    CreateBuyNowCartFailed = 'CREATE_BUY_NOW_CART_FAILED',
}

export type CartAction = CreateBuyNowCartAction;

export type CreateBuyNowCartAction =
    | CreateBuyNowCartRequestedAction
    | CreateBuyNowCartSucceededAction
    | CreateBuyNowCartFailedAction
    | LoadCheckoutAction;

export interface CreateBuyNowCartRequestedAction extends Action {
    type: CartActionType.CreateBuyNowCartRequested;
}

export interface CreateBuyNowCartSucceededAction extends Action {
    type: CartActionType.CreateBuyNowCartSucceeded;
}

export interface CreateBuyNowCartFailedAction extends Action {
    type: CartActionType.CreateBuyNowCartFailed;
}
