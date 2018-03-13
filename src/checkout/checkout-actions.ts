import { Action } from '@bigcommerce/data-store';
import Checkout from './checkout';

export enum CheckoutActionType {
    LoadCheckoutRequested = 'LOAD_CHECKOUT_REQUESTED',
    LoadCheckoutSucceeded = 'LOAD_CHECKOUT_SUCCEEDED',
    LoadCheckoutFailed = 'LOAD_CHECKOUT_FAILED',
}

export type CheckoutAction =
    LoadCheckoutRequestedAction |
    LoadCheckoutSucceededAction |
    LoadCheckoutFailedAction;

export interface LoadCheckoutRequestedAction extends Action {
    type: CheckoutActionType.LoadCheckoutRequested;
}

export interface LoadCheckoutSucceededAction extends Action<Checkout> {
    type: CheckoutActionType.LoadCheckoutSucceeded;
}

export interface LoadCheckoutFailedAction extends Action<Error> {
    type: CheckoutActionType.LoadCheckoutFailed;
}
