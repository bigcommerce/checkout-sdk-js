import { combineReducers } from '@bigcommerce/data-store';
import * as actionTypes from './remote-checkout-action-types';

/**
 * @param {RemoteCheckoutState} state
 * @param {Action} action
 * @return {RemoteCheckoutState}
 */
export default function remoteCheckoutReducer(state = {}, action) {
    const reducer = combineReducers({
        data: dataReducer,
        meta: metaReducer,
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
        return { ...data, billingAddress: action.payload.billing && action.payload.billing.address };

    case actionTypes.INITIALIZE_REMOTE_SHIPPING_SUCCEEDED:
        return { ...data, shippingAddress: action.payload.shipping && action.payload.shipping.address };

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
