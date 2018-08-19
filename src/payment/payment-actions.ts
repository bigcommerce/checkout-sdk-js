import { Action } from '@bigcommerce/data-store';

import { LoadOrderAction } from '../order';

import PaymentResponseBody from './payment-response-body';

export enum PaymentActionType {
    SubmitPaymentRequested = 'SUBMIT_PAYMENT_REQUESTED',
    SubmitPaymentSucceeded = 'SUBMIT_PAYMENT_SUCCEEDED',
    SubmitPaymentFailed = 'SUBMIT_PAYMENT_FAILED',

    InitializeOffsitePaymentRequested = 'INITIALIZE_OFFSITE_PAYMENT_REQUESTED',
    InitializeOffsitePaymentSucceeded = 'INITIALIZE_OFFSITE_PAYMENT_SUCCEEDED',
    InitializeOffsitePaymentFailed = 'INITIALIZE_OFFSITE_PAYMENT_FAILED',
}

export type PaymentAction = SubmitPaymentAction |
    InitializeOffsitePaymentAction;

export type SubmitPaymentAction =
    SubmitPaymentRequestedAction |
    SubmitPaymentSucceededAction |
    SubmitPaymentFailedAction |
    LoadOrderAction;

export type InitializeOffsitePaymentAction =
    InitializeOffsitePaymentRequestedAction |
    InitializeOffsitePaymentSucceededAction |
    InitializeOffsitePaymentFailedAction;

export interface SubmitPaymentRequestedAction extends Action {
    type: PaymentActionType.SubmitPaymentRequested;
}

export interface SubmitPaymentSucceededAction extends Action<PaymentResponseBody> {
    type: PaymentActionType.SubmitPaymentSucceeded;
}

export interface SubmitPaymentFailedAction extends Action<Error> {
    type: PaymentActionType.SubmitPaymentFailed;
}

export interface InitializeOffsitePaymentRequestedAction extends Action {
    type: PaymentActionType.InitializeOffsitePaymentRequested;
}

export interface InitializeOffsitePaymentSucceededAction extends Action {
    type: PaymentActionType.InitializeOffsitePaymentSucceeded;
}

export interface InitializeOffsitePaymentFailedAction extends Action<Error> {
    type: PaymentActionType.InitializeOffsitePaymentFailed;
}
