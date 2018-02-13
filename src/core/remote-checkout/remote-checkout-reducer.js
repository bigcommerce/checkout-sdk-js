import * as actionTypes from './remote-checkout-action-types';
import { combineReducers } from '../../data-store';

/**
 * @param {RemoteCheckoutState} state
 * @param {Action} action
 * @return {RemoteCheckoutState}
 */
export default function remoteCheckoutReducer(state = {}, action) {
    const reducer = combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        meta: metaReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

/**
 * @private
 * @param {?RemoteCheckout} data
 * @param {Action} action
 * @return {?RemoteCheckout}
 */
function dataReducer(data, action) {
    switch (action.type) {
    case actionTypes.INITIALIZE_REMOTE_BILLING_SUCCEEDED:
        return action.payload.billing ? { ...data, billingAddress: action.payload.billing.address } : data;

    case actionTypes.INITIALIZE_REMOTE_SHIPPING_SUCCEEDED:
        return action.payload.shipping ? { ...data, shippingAddress: action.payload.shipping.address } : data;

    case actionTypes.INITIALIZE_REMOTE_PAYMENT_SUCCEEDED:
        return { ...data, isPaymentInitialized: action.payload.payment };

    default:
        return data;
    }
}

/**
 * @private
 * @param {?RemoteCheckoutMeta} meta
 * @param {Action} action
 * @return {?RemoteCheckoutMeta}
 */
function metaReducer(meta, action) {
    switch (action.type) {
    case actionTypes.SET_REMOTE_CHECKOUT_META:
        return { ...meta, ...action.payload };

    default:
        return meta;
    }
}

/**
 * @private
 * @param {Object} errors
 * @param {Action} action
 * @return {Object}
 */
function errorsReducer(errors = {}, action) {
    switch (action.type) {
    case actionTypes.INITIALIZE_REMOTE_BILLING_REQUESTED:
    case actionTypes.INITIALIZE_REMOTE_BILLING_SUCCEEDED:
        return { ...errors, initializeBillingError: undefined };

    case actionTypes.INITIALIZE_REMOTE_BILLING_FAILED:
        return { ...errors, initializeBillingError: action.payload };

    case actionTypes.INITIALIZE_REMOTE_SHIPPING_REQUESTED:
    case actionTypes.INITIALIZE_REMOTE_SHIPPING_SUCCEEDED:
        return { ...errors, initializeShippingError: undefined };

    case actionTypes.INITIALIZE_REMOTE_SHIPPING_FAILED:
        return { ...errors, initializeShippingError: action.payload };

    case actionTypes.INITIALIZE_REMOTE_PAYMENT_REQUESTED:
    case actionTypes.INITIALIZE_REMOTE_PAYMENT_SUCCEEDED:
        return {
            ...errors,
            failedPaymentMethod: undefined,
            initializePaymentError: undefined,
        };

    case actionTypes.INITIALIZE_REMOTE_PAYMENT_FAILED:
        return {
            ...errors,
            failedPaymentMethod: action.meta && action.meta.methodId,
            initializePaymentError: action.payload,
        };

    case actionTypes.SIGN_OUT_REMOTE_CUSTOMER_REQUESTED:
    case actionTypes.SIGN_OUT_REMOTE_CUSTOMER_SUCCEEDED:
        return { ...errors, signOutError: undefined };

    case actionTypes.SIGN_OUT_REMOTE_CUSTOMER_FAILED:
        return { ...errors, signOutError: action.payload };

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
    case actionTypes.INITIALIZE_REMOTE_BILLING_REQUESTED:
        return { ...statuses, isInitializingBilling: true };

    case actionTypes.INITIALIZE_REMOTE_BILLING_SUCCEEDED:
    case actionTypes.INITIALIZE_REMOTE_BILLING_FAILED:
        return { ...statuses, isInitializingBilling: false };

    case actionTypes.INITIALIZE_REMOTE_SHIPPING_REQUESTED:
        return { ...statuses, isInitializingShipping: true };

    case actionTypes.INITIALIZE_REMOTE_SHIPPING_SUCCEEDED:
    case actionTypes.INITIALIZE_REMOTE_SHIPPING_FAILED:
        return { ...statuses, isInitializingShipping: false };

    case actionTypes.INITIALIZE_REMOTE_PAYMENT_REQUESTED:
        return {
            ...statuses,
            isInitializingPayment: true,
            loadingPaymentMethod: action.meta && action.meta.methodId,
        };

    case actionTypes.INITIALIZE_REMOTE_PAYMENT_SUCCEEDED:
    case actionTypes.INITIALIZE_REMOTE_PAYMENT_FAILED:
        return {
            ...statuses,
            isInitializingPayment: false,
            loadingPaymentMethod: undefined,
        };

    case actionTypes.SIGN_OUT_REMOTE_CUSTOMER_REQUESTED:
        return { ...statuses, isSigningOut: true };

    case actionTypes.SIGN_OUT_REMOTE_CUSTOMER_SUCCEEDED:
    case actionTypes.SIGN_OUT_REMOTE_CUSTOMER_FAILED:
        return { ...statuses, isSigningOut: false };

    default:
        return statuses;
    }
}
