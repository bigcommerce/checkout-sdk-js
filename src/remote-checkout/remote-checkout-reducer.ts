import { combineReducers } from '@bigcommerce/data-store';

import { objectMerge, objectSet } from '../common/utility';

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
        return objectSet(data, 'billing' as any, action.payload && action.payload.billing);

    case RemoteCheckoutActionType.InitializeRemoteShippingSucceeded:
        return objectSet(data, 'shipping' as any, action.payload && action.payload.shipping);

    case RemoteCheckoutActionType.LoadRemoteSettingsSucceeded:
        return objectSet(data, 'settings', action.payload);

    case RemoteCheckoutActionType.UpdateRemoteCheckout:
        return objectMerge(data, action.payload);

    default:
        return data;
    }
}
