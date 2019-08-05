import { combineReducers } from '@bigcommerce/data-store';

import RemoteCheckout from './remote-checkout';
import { RemoteCheckoutAction, RemoteCheckoutActionType } from './remote-checkout-actions';
import RemoteCheckoutState, { DEFAULT_STATE, RemoteCheckoutStateData } from './remote-checkout-state';

export default function remoteCheckoutReducer(
    state: RemoteCheckoutState = DEFAULT_STATE,
    action: RemoteCheckoutAction
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
    data: RemoteCheckout = DEFAULT_STATE.data,
    action: RemoteCheckoutAction
): RemoteCheckout {
    switch (action.type) {
    case RemoteCheckoutActionType.InitializeRemoteBillingSucceeded:
        return action.payload ? { ...data, billing: action.payload.billing } : data;

    case RemoteCheckoutActionType.InitializeRemoteShippingSucceeded:
        return action.payload ? { ...data, shipping: action.payload.shipping } : data;

    case RemoteCheckoutActionType.LoadRemoteSettingsSucceeded:
        return { ...data, settings: action.payload };

    case RemoteCheckoutActionType.UpdateRemoteCheckout:
        return { ...data, ...action.payload };

    default:
        return data;
    }
}
