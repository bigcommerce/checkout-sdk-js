import { Action, combineReducers } from '@bigcommerce/data-store';

import { replace } from '../common/utility';
import { OrderAction, OrderActionType } from '../order';

import OrderBillingAddressState, {
    DEFAULT_STATE,
    OrderBillingAddress,
} from './order-billing-address-state';

export default function orderBillingAddressReducer(
    state: OrderBillingAddressState = DEFAULT_STATE,
    action: Action,
): OrderBillingAddressState {
    const reducer = combineReducers<OrderBillingAddressState>({
        data: dataReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: OrderBillingAddress | undefined,
    action: OrderAction,
): OrderBillingAddress | undefined {
    switch (action.type) {
        case OrderActionType.LoadOrderPaymentsSucceeded:
        case OrderActionType.LoadOrderSucceeded:
            return replace(data, action.payload && action.payload.billingAddress);

        default:
            return data;
    }
}
