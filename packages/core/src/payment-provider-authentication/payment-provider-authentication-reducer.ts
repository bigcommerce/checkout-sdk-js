import { combineReducers } from '@bigcommerce/data-store';

import { objectMerge } from '../common/utility';

import { PaymentProviderAuthentication } from './payment-provider-authentication';
import {
    PaymentProviderAuthenticationType,
    UpdatePaymentProviderAuthenticationAction,
} from './payment-provider-authentication-actions';
import PaymentProviderAuthenticationState, {
    DEFAULT_STATE,
} from './payment-provider-authentication-state';

type ReducerActionType = UpdatePaymentProviderAuthenticationAction;

export default function paymentProviderAuthenticationReducer(
    state: PaymentProviderAuthenticationState = DEFAULT_STATE,
    action: ReducerActionType,
): PaymentProviderAuthenticationState {
    const reducer = combineReducers<PaymentProviderAuthenticationState, ReducerActionType>({
        data: dataReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: PaymentProviderAuthentication = DEFAULT_STATE.data,
    action: ReducerActionType,
): PaymentProviderAuthentication {
    switch (action.type) {
        case PaymentProviderAuthenticationType.UpdatePaymentProviderAuthentication:
            return objectMerge(data, action.payload);

        default:
            return data;
    }
}
