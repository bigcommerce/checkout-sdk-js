import { Action } from '@bigcommerce/data-store';

import { LoadConfigAction } from '../config';

import Checkout from './checkout';

export enum CheckoutActionType {
    LoadCheckoutRequested = 'LOAD_CHECKOUT_REQUESTED',
    LoadCheckoutSucceeded = 'LOAD_CHECKOUT_SUCCEEDED',
    LoadCheckoutFailed = 'LOAD_CHECKOUT_FAILED',

    UpdateCheckoutRequested = 'UPDATE_CHECKOUT_REQUESTED',
    UpdateCheckoutSucceeded = 'UPDATE_CHECKOUT_SUCCEEDED',
    UpdateCheckoutFailed = 'UPDATE_CHECKOUT_FAILED',
}

export type CheckoutAction = LoadCheckoutAction | UpdateCheckoutAction;

export type LoadCheckoutAction =
    LoadCheckoutRequestedAction |
    LoadCheckoutSucceededAction |
    LoadCheckoutFailedAction |
    LoadConfigAction;

export type UpdateCheckoutAction =
    UpdateCheckoutRequestedAction |
    UpdateCheckoutSucceededAction |
    UpdateCheckoutFailedAction;

export interface LoadCheckoutRequestedAction extends Action {
    type: CheckoutActionType.LoadCheckoutRequested;
}

export interface LoadCheckoutSucceededAction extends Action<Checkout> {
    type: CheckoutActionType.LoadCheckoutSucceeded;
}

export interface LoadCheckoutFailedAction extends Action<Error> {
    type: CheckoutActionType.LoadCheckoutFailed;
}

export interface UpdateCheckoutRequestedAction extends Action {
    type: CheckoutActionType.UpdateCheckoutRequested;
}

export interface UpdateCheckoutSucceededAction extends Action<Checkout> {
    type: CheckoutActionType.UpdateCheckoutSucceeded;
}

export interface UpdateCheckoutFailedAction extends Action<Error> {
    type: CheckoutActionType.UpdateCheckoutFailed;
}
