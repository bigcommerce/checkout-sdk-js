import { combineReducers } from '@bigcommerce/data-store';

import { CheckoutAction, CheckoutActionType } from '../checkout';

import { GiftCertificateAction, GiftCertificateActionType } from './gift-certificate-actions';
import GiftCertificateState, { GiftCertificateErrorsState, GiftCertificateStatusesState } from './gift-certificate-state';
import InternalGiftCertificate from './internal-gift-certificate';

const DEFAULT_STATE: GiftCertificateState = {
    errors: {},
    statuses: {},
};

export default function giftCertificateReducer(
    state: GiftCertificateState = DEFAULT_STATE,
    action: CheckoutAction | GiftCertificateAction
): GiftCertificateState {
    const reducer = combineReducers<GiftCertificateState>({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: InternalGiftCertificate[] | undefined,
    action: CheckoutAction
): InternalGiftCertificate[] | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return action.payload.giftCertificates;

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
