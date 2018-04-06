import { combineReducers, Action } from '@bigcommerce/data-store';

import { CheckoutActionType } from '../checkout';

import * as giftCertificateActionTypes from './gift-certificate-action-types';
import InternalGiftCertificate from './internal-gift-certificate';

/**
 * @todo Convert this file into TypeScript properly
 * @param {GiftCertificateState} state
 * @param {Action} action
 * @return {GiftCertificateState}
 */
export default function giftCertificateReducer(state: any = {}, action: Action): any {
    const reducer = combineReducers<any>({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: InternalGiftCertificate[], action: Action): InternalGiftCertificate[] {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return action.payload.giftCertificates;

    default:
        return data;
    }
}

function errorsReducer(errors: any = {}, action: Action): any {
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

function statusesReducer(statuses: any = {}, action: Action): any {
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
