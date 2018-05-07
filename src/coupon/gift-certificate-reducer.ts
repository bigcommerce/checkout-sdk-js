import { combineReducers, Action } from '@bigcommerce/data-store';

import { CheckoutActionType } from '../checkout';

import * as giftCertificateActionTypes from './gift-certificate-action-types';
import GiftCertificateState, { GiftCertificateErrorsState, GiftCertificateStatusesState } from './gift-certificate-state';
import InternalGiftCertificate from './internal-gift-certificate';

const DEFAULT_STATE: GiftCertificateState = {
    errors: {},
    statuses: {},
};

/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Action
 */
export default function giftCertificateReducer(state: GiftCertificateState = DEFAULT_STATE, action: Action): GiftCertificateState {
    const reducer = combineReducers<GiftCertificateState>({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: InternalGiftCertificate[] | undefined, action: Action): InternalGiftCertificate[] | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return action.payload.giftCertificates;

    default:
        return data;
    }
}

function errorsReducer(errors: GiftCertificateErrorsState = DEFAULT_STATE.errors, action: Action): GiftCertificateErrorsState {
    switch (action.type) {
    case giftCertificateActionTypes.APPLY_GIFT_CERTIFICATE_REQUESTED:
    case giftCertificateActionTypes.APPLY_GIFT_CERTIFICATE_SUCCEEDED:
        return { ...errors, applyGiftCertificateError: undefined };

    case giftCertificateActionTypes.APPLY_GIFT_CERTIFICATE_FAILED:
        return { ...errors, applyGiftCertificateError: action.payload };

    case giftCertificateActionTypes.REMOVE_GIFT_CERTIFICATE_REQUESTED:
    case giftCertificateActionTypes.REMOVE_GIFT_CERTIFICATE_SUCCEEDED:
        return { ...errors, removeGiftCertificateError: undefined };

    case giftCertificateActionTypes.REMOVE_GIFT_CERTIFICATE_FAILED:
        return { ...errors, removeGiftCertificateError: action.payload };

    default:
        return errors;
    }
}

function statusesReducer(statuses: GiftCertificateStatusesState = DEFAULT_STATE.statuses, action: Action): GiftCertificateStatusesState {
    switch (action.type) {
    case giftCertificateActionTypes.APPLY_GIFT_CERTIFICATE_REQUESTED:
        return { ...statuses, isApplyingGiftCertificate: true };

    case giftCertificateActionTypes.APPLY_GIFT_CERTIFICATE_SUCCEEDED:
    case giftCertificateActionTypes.APPLY_GIFT_CERTIFICATE_FAILED:
        return { ...statuses, isApplyingGiftCertificate: false };

    case giftCertificateActionTypes.REMOVE_GIFT_CERTIFICATE_REQUESTED:
        return { ...statuses, isRemovingGiftCertificate: true };

    case giftCertificateActionTypes.REMOVE_GIFT_CERTIFICATE_SUCCEEDED:
    case giftCertificateActionTypes.REMOVE_GIFT_CERTIFICATE_FAILED:
        return { ...statuses, isRemovingGiftCertificate: false };

    default:
        return statuses;
    }
}
