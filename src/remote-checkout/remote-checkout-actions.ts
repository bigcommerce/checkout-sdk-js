import { Action } from '@bigcommerce/data-store';

import { AmazonPayRemoteCheckout } from './methods';

export enum RemoteCheckoutActionType {
    InitializeRemoteBillingRequested = 'INITIALIZE_REMOTE_BILLING_REQUESTED',
    InitializeRemoteBillingSucceeded = 'INITIALIZE_REMOTE_BILLING_SUCCEEDED',
    InitializeRemoteBillingFailed = 'INITIALIZE_REMOTE_BILLING_FAILED',

    InitializeRemoteShippingRequested = 'INITIALIZE_REMOTE_SHIPPING_REQUESTED',
    InitializeRemoteShippingSucceeded = 'INITIALIZE_REMOTE_SHIPPING_SUCCEEDED',
    InitializeRemoteShippingFailed = 'INITIALIZE_REMOTE_SHIPPING_FAILED',

    InitializeRemotePaymentRequested = 'INITIALIZE_REMOTE_PAYMENT_REQUESTED',
    InitializeRemotePaymentSucceeded = 'INITIALIZE_REMOTE_PAYMENT_SUCCEEDED',
    InitializeRemotePaymentFailed = 'INITIALIZE_REMOTE_PAYMENT_FAILED',

    LoadRemoteSettingsRequested = 'LOAD_REMOTE_SETTINGS_REQUESTED',
    LoadRemoteSettingsSucceeded = 'LOAD_REMOTE_SETTINGS_SUCCEEDED',
    LoadRemoteSettingsFailed = 'LOAD_REMOTE_SETTINGS_FAILED',

    SignOutRemoteCustomerRequested = 'SIGN_OUT_REMOTE_CUSTOMER_REQUESTED',
    SignOutRemoteCustomerSucceeded = 'SIGN_OUT_REMOTE_CUSTOMER_SUCCEEDED',
    SignOutRemoteCustomerFailed = 'SIGN_OUT_REMOTE_CUSTOMER_FAILED',

    UpdateRemoteCheckout = 'UPDATE_REMOTE_CHECKOUT',
}

export type RemoteCheckoutAction = InitializeRemoteBillingAction |
    InitializeRemoteShippingAction |
    InitializeRemotePaymentAction |
    SignOutRemoteCustomerAction |
    LoadRemoteSettingsAction |
    UpdateRemoteCheckoutAction;

export type InitializeRemoteBillingAction = InitializeRemoteBillingSucceededAction |
    InitializeRemoteBillingFailedAction |
    InitializeRemoteBillingRequestedAction;

export interface InitializeRemoteBillingSucceededAction extends Action<AmazonPayRemoteCheckout> {
    type: RemoteCheckoutActionType.InitializeRemoteBillingSucceeded;
}

export interface InitializeRemoteBillingFailedAction extends Action {
    type: RemoteCheckoutActionType.InitializeRemoteBillingFailed;
}

export interface InitializeRemoteBillingRequestedAction extends Action {
    type: RemoteCheckoutActionType.InitializeRemoteBillingRequested;
}

export type InitializeRemoteShippingAction = InitializeRemoteShippingSucceededAction |
    InitializeRemoteShippingFailedAction |
    InitializeRemoteShippingRequestedAction;

export interface InitializeRemoteShippingSucceededAction extends Action<AmazonPayRemoteCheckout> {
    type: RemoteCheckoutActionType.InitializeRemoteShippingSucceeded;
}

export interface InitializeRemoteShippingFailedAction extends Action {
    type: RemoteCheckoutActionType.InitializeRemoteShippingFailed;
}

export interface InitializeRemoteShippingRequestedAction extends Action {
    type: RemoteCheckoutActionType.InitializeRemoteShippingRequested;
}

export type InitializeRemotePaymentAction = InitializeRemotePaymentSucceededAction |
    InitializeRemotePaymentFailedAction |
    InitializeRemotePaymentRequestedAction;

export interface InitializeRemotePaymentSucceededAction extends Action {
    type: RemoteCheckoutActionType.InitializeRemotePaymentSucceeded;
}

export interface InitializeRemotePaymentFailedAction extends Action {
    type: RemoteCheckoutActionType.InitializeRemotePaymentFailed;
}

export interface InitializeRemotePaymentRequestedAction extends Action {
    type: RemoteCheckoutActionType.InitializeRemotePaymentRequested;
}

export type SignOutRemoteCustomerAction = SignOutRemoteCustomerSucceededAction |
    SignOutRemoteCustomerFailedAction |
    SignOutRemoteCustomerRequestedAction;

export interface SignOutRemoteCustomerSucceededAction extends Action {
    type: RemoteCheckoutActionType.SignOutRemoteCustomerSucceeded;
}

export interface SignOutRemoteCustomerFailedAction extends Action {
    type: RemoteCheckoutActionType.SignOutRemoteCustomerFailed;
}

export interface SignOutRemoteCustomerRequestedAction extends Action {
    type: RemoteCheckoutActionType.SignOutRemoteCustomerRequested;
}

export type LoadRemoteSettingsAction = LoadRemoteSettingsSucceededAction |
    LoadRemoteSettingsRequestedAction |
    LoadRemoteSettingsFailedAction;

export interface LoadRemoteSettingsSucceededAction extends Action {
    type: RemoteCheckoutActionType.LoadRemoteSettingsSucceeded;
}

export interface LoadRemoteSettingsRequestedAction extends Action {
    type: RemoteCheckoutActionType.LoadRemoteSettingsRequested;
}

export interface LoadRemoteSettingsFailedAction extends Action {
    type: RemoteCheckoutActionType.LoadRemoteSettingsFailed;
}

export interface UpdateRemoteCheckoutAction extends Action {
    type: RemoteCheckoutActionType.UpdateRemoteCheckout;
}
