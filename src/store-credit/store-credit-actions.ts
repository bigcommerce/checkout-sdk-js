import { Action } from '@bigcommerce/data-store';

import { Checkout } from '../checkout';
import { StorefrontErrorResponseBody } from '../common/error';
import { RequestError } from '../common/error/errors';

export enum StoreCreditActionType {
    ApplyStoreCreditRequested = 'APPLY_STORE_CREDIT_REQUESTED',
    ApplyStoreCreditSucceeded = 'APPLY_STORE_CREDIT_SUCCEEDED',
    ApplyStoreCreditFailed = 'APPLY_STORE_CREDIT_FAILED',
}

export type StoreCreditAction =
    ApplyStoreCreditAction;

export type ApplyStoreCreditAction =
    ApplyStoreCreditRequestedAction |
    ApplyStoreCreditSucceededAction |
    ApplyStoreCreditFailedAction;

export interface ApplyStoreCreditRequestedAction extends Action {
    type: StoreCreditActionType.ApplyStoreCreditRequested;
}

export interface ApplyStoreCreditSucceededAction extends Action<Checkout> {
    type: StoreCreditActionType.ApplyStoreCreditSucceeded;
}

export interface ApplyStoreCreditFailedAction extends Action<RequestError<StorefrontErrorResponseBody>> {
    type: StoreCreditActionType.ApplyStoreCreditFailed;
}
