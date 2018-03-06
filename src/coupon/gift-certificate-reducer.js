import { combineReducers } from '@bigcommerce/data-store';
import * as giftCertificateActionTypes from './gift-certificate-action-types';

/**
 * @param {GiftCertificateState} state
 * @param {Action} action
 * @return {GiftCertificateState}
 */
export default function giftCertificateReducer(state = {}, action) {
    const reducer = combineReducers({
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

/**
 * @private
 * @param {Object} errors
 * @param {Action} action
 * @return {Object}
 */
function errorsReducer(errors = {}, action) {
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

/**
 * @private
 * @param {Object} statuses
 * @param {Action} action
 * @return {Object}
 */
function statusesReducer(statuses = {}, action) {
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
