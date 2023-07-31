import { combineReducers } from '@bigcommerce/data-store';

import { objectMerge } from '../common/utility';

import { PaymentProviderCustomer } from './payment-provider-customer';
import {
    PaymentProviderCustomerType,
    UpdatePaymentProviderCustomerAction,
} from './payment-provider-customer-actions';
import PaymentProviderCustomerState, { DEFAULT_STATE } from './payment-provider-customer-state';

type ReducerActionType = UpdatePaymentProviderCustomerAction;

export default function paymentProviderCustomerReducer(
    state: PaymentProviderCustomerState = DEFAULT_STATE,
    action: ReducerActionType,
): PaymentProviderCustomerState {
    const reducer = combineReducers<PaymentProviderCustomerState, ReducerActionType>({
        data: dataReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: PaymentProviderCustomer = DEFAULT_STATE.data,
    action: ReducerActionType,
): PaymentProviderCustomer {
    switch (action.type) {
        case PaymentProviderCustomerType.UpdatePaymentProviderCustomer:
            return objectMerge(data, action.payload);

        default:
            return data;
    }
}
