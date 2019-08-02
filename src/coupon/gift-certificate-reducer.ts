import { combineReducers, composeReducers, Action } from '@bigcommerce/data-store';

import { CheckoutAction, CheckoutActionType } from '../checkout';
import { clearErrorReducer } from '../common/error';
import { ConsignmentAction, ConsignmentActionType } from '../shipping/consignment-actions';

import { CouponAction, CouponActionType } from './coupon-actions';
import GiftCertificate from './gift-certificate';
import { GiftCertificateAction, GiftCertificateActionType } from './gift-certificate-actions';
import GiftCertificateState, { DEFAULT_STATE, GiftCertificateErrorsState, GiftCertificateStatusesState } from './gift-certificate-state';

export default function giftCertificateReducer(
    state: GiftCertificateState = DEFAULT_STATE,
    action: Action
): GiftCertificateState {
    const reducer = combineReducers<GiftCertificateState>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: GiftCertificate[] | undefined,
    action: CheckoutAction | GiftCertificateAction | ConsignmentAction | CouponAction
): GiftCertificate[] | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
    case ConsignmentActionType.CreateConsignmentsSucceeded:
    case ConsignmentActionType.UpdateConsignmentSucceeded:
    case ConsignmentActionType.DeleteConsignmentSucceeded:
    case ConsignmentActionType.UpdateShippingOptionSucceeded:
    case CouponActionType.ApplyCouponSucceeded:
    case CouponActionType.RemoveCouponSucceeded:
    case GiftCertificateActionType.ApplyGiftCertificateSucceeded:
    case GiftCertificateActionType.RemoveGiftCertificateSucceeded:
        return action.payload ? action.payload.giftCertificates : data;

    default:
        return data;
    }
}

function errorsReducer(
    errors: GiftCertificateErrorsState = DEFAULT_STATE.errors,
    action: GiftCertificateAction
): GiftCertificateErrorsState {
    switch (action.type) {
    case GiftCertificateActionType.ApplyGiftCertificateRequested:
    case GiftCertificateActionType.ApplyGiftCertificateSucceeded:
        return { ...errors, applyGiftCertificateError: undefined };

    case GiftCertificateActionType.ApplyGiftCertificateFailed:
        return { ...errors, applyGiftCertificateError: action.payload };

    case GiftCertificateActionType.RemoveGiftCertificateRequested:
    case GiftCertificateActionType.RemoveGiftCertificateSucceeded:
        return { ...errors, removeGiftCertificateError: undefined };

    case GiftCertificateActionType.RemoveGiftCertificateFailed:
        return { ...errors, removeGiftCertificateError: action.payload };

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: GiftCertificateStatusesState = DEFAULT_STATE.statuses,
    action: GiftCertificateAction
): GiftCertificateStatusesState {
    switch (action.type) {
    case GiftCertificateActionType.ApplyGiftCertificateRequested:
        return { ...statuses, isApplyingGiftCertificate: true };

    case GiftCertificateActionType.ApplyGiftCertificateSucceeded:
    case GiftCertificateActionType.ApplyGiftCertificateFailed:
        return { ...statuses, isApplyingGiftCertificate: false };

    case GiftCertificateActionType.RemoveGiftCertificateRequested:
        return { ...statuses, isRemovingGiftCertificate: true };

    case GiftCertificateActionType.RemoveGiftCertificateSucceeded:
    case GiftCertificateActionType.RemoveGiftCertificateFailed:
        return { ...statuses, isRemovingGiftCertificate: false };

    default:
        return statuses;
    }
}
