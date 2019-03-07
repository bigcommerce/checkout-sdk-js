import { Action } from '@bigcommerce/data-store';

import { Checkout } from '../checkout';
import { StorefrontErrorResponseBody } from '../common/error';
import { RequestError } from '../common/error/errors';

export enum GiftCertificateActionType {
    ApplyGiftCertificateRequested = 'APPLY_GIFT_CERTIFICATE_REQUESTED',
    ApplyGiftCertificateSucceeded = 'APPLY_GIFT_CERTIFICATE_SUCCEEDED',
    ApplyGiftCertificateFailed = 'APPLY_GIFT_CERTIFICATE_FAILED',

    RemoveGiftCertificateRequested = 'REMOVE_GIFT_CERTIFICATE_REQUESTED',
    RemoveGiftCertificateSucceeded = 'REMOVE_GIFT_CERTIFICATE_SUCCEEDED',
    RemoveGiftCertificateFailed = 'REMOVE_GIFT_CERTIFICATE_FAILED',
}

export type GiftCertificateAction =
    ApplyGiftCertificateAction |
    RemoveGiftCertificateAction;

export type ApplyGiftCertificateAction =
    ApplyGiftCertificateRequestedAction |
    ApplyGiftCertificateSucceededAction |
    ApplyGiftCertificateFailedAction;

export type RemoveGiftCertificateAction =
    RemoveGiftCertificateRequestedAction |
    RemoveGiftCertificateSucceededAction |
    RemoveGiftCertificateFailedAction;

export interface ApplyGiftCertificateRequestedAction extends Action {
    type: GiftCertificateActionType.ApplyGiftCertificateRequested;
}

export interface ApplyGiftCertificateSucceededAction extends Action<Checkout> {
    type: GiftCertificateActionType.ApplyGiftCertificateSucceeded;
}

export interface ApplyGiftCertificateFailedAction extends Action<RequestError<StorefrontErrorResponseBody>> {
    type: GiftCertificateActionType.ApplyGiftCertificateFailed;
}

export interface RemoveGiftCertificateRequestedAction extends Action {
    type: GiftCertificateActionType.RemoveGiftCertificateRequested;
}

export interface RemoveGiftCertificateSucceededAction extends Action<Checkout> {
    type: GiftCertificateActionType.RemoveGiftCertificateSucceeded;
}

export interface RemoveGiftCertificateFailedAction extends Action<RequestError<StorefrontErrorResponseBody>> {
    type: GiftCertificateActionType.RemoveGiftCertificateFailed;
}
