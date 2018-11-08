import { Action } from '@bigcommerce/data-store';

import { Checkout } from '../checkout';
import { StorefrontErrorResponseBody } from '../common/error';
import { RequestError } from '../common/error/errors';

export enum CouponActionType {
    ApplyCouponRequested = 'APPLY_COUPON_REQUESTED',
    ApplyCouponSucceeded = 'APPLY_COUPON_SUCCEEDED',
    ApplyCouponFailed = 'APPLY_COUPON_FAILED',

    RemoveCouponRequested = 'REMOVE_COUPON_REQUESTED',
    RemoveCouponSucceeded = 'REMOVE_COUPON_SUCCEEDED',
    RemoveCouponFailed = 'REMOVE_COUPON_FAILED',
}

export type CouponAction =
    ApplyCouponAction |
    RemoveCouponAction;

export type ApplyCouponAction =
    ApplyCouponRequestedAction |
    ApplyCouponSucceededAction |
    ApplyCouponFailedAction;

export type RemoveCouponAction =
    RemoveCouponRequestedAction |
    RemoveCouponSucceededAction |
    RemoveCouponFailedAction;

export interface ApplyCouponRequestedAction extends Action {
    type: CouponActionType.ApplyCouponRequested;
}

export interface ApplyCouponSucceededAction extends Action<Checkout> {
    type: CouponActionType.ApplyCouponSucceeded;
}

export interface ApplyCouponFailedAction extends Action<RequestError<StorefrontErrorResponseBody>> {
    type: CouponActionType.ApplyCouponFailed;
}

export interface RemoveCouponRequestedAction extends Action {
    type: CouponActionType.RemoveCouponRequested;
}

export interface RemoveCouponSucceededAction extends Action<Checkout> {
    type: CouponActionType.RemoveCouponSucceeded;
}

export interface RemoveCouponFailedAction extends Action<RequestError> {
    type: CouponActionType.RemoveCouponFailed;
}
