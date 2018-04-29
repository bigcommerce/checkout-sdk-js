import { combineReducers, Action } from '@bigcommerce/data-store';

import { AfterpayRemoteCheckout } from './methods/afterpay';
import { AmazonPayRemoteCheckout } from './methods/amazon-pay';
import * as actionTypes from './remote-checkout-action-types';
import RemoteCheckoutState, { RemoteCheckoutStateData } from './remote-checkout-state';

const DEFAULT_STATE: RemoteCheckoutState = {
    data: {},
};

type RemoteCheckout = AfterpayRemoteCheckout | AmazonPayRemoteCheckout;

export default function remoteCheckoutReducer(
    state: RemoteCheckoutState = DEFAULT_STATE,
    action: Action
): RemoteCheckoutState {
    if (!action.meta || !action.meta.methodId) {
        return state;
    }

    const reducer = combineReducers<RemoteCheckoutState>({
        data: combineReducers<RemoteCheckoutStateData>({
            [action.meta.methodId]: dataReducer,
        }),
    });

    return reducer(state, action);
}

function dataReducer(
    data: RemoteCheckout = {},
    action: Action
): RemoteCheckout {
    switch (action.type) {
    case actionTypes.INITIALIZE_REMOTE_BILLING_SUCCEEDED:
        return { ...data, billing: action.payload.billing };

    case actionTypes.INITIALIZE_REMOTE_SHIPPING_SUCCEEDED:
        return { ...data, shipping: action.payload.shipping };

    case actionTypes.LOAD_REMOTE_SETTINGS_SUCCEEDED:
        return { ...data, settings: action.payload };

    case actionTypes.UPDATE_REMOTE_CHECKOUT:
        return { ...data, ...action.payload };

    default:
        return data;
    }
}
