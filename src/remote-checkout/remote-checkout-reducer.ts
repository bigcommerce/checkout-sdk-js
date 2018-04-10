import { combineReducers, Action } from '@bigcommerce/data-store';

import RemoteCheckout from './remote-checkout';
import * as actionTypes from './remote-checkout-action-types';
import RemoteCheckoutMeta from './remote-checkout-meta';
import RemoteCheckoutState from './remote-checkout-state';

export default function remoteCheckoutReducer(state: RemoteCheckoutState = {}, action: Action): RemoteCheckoutState {
    const reducer = combineReducers<RemoteCheckoutState>({
        data: dataReducer,
        meta: metaReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: RemoteCheckout = {}, action: Action): RemoteCheckout {
    switch (action.type) {
    case actionTypes.INITIALIZE_REMOTE_BILLING_SUCCEEDED:
        return { ...data, billingAddress: action.payload.billing && action.payload.billing.address };

    case actionTypes.INITIALIZE_REMOTE_SHIPPING_SUCCEEDED:
        return { ...data, shippingAddress: action.payload.shipping && action.payload.shipping.address };

    default:
        return data;
    }
}

function metaReducer(meta: RemoteCheckoutMeta = {}, action: Action): RemoteCheckoutMeta {
    switch (action.type) {
    case actionTypes.SET_REMOTE_CHECKOUT_META:
        return { ...meta, ...action.payload };

    default:
        return meta;
    }
}
