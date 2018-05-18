import { combineReducers, Action } from '@bigcommerce/data-store';

import { BillingAddressActionTypes } from '../billing/billing-address-actions';
import { CheckoutActionType } from '../checkout';
import * as customerActionTypes from '../customer/customer-action-types';
import { ConsignmentActionTypes } from '../shipping/consignment-actions';

import InternalQuote from './internal-quote';
import mapToInternalQuote from './map-to-internal-quote';
import QuoteState, { QuoteErrorsState, QuoteStatusesState } from './quote-state';

const DEFAULT_STATE: QuoteState = {
    errors: {},
    meta: {},
    statuses: {},
};

/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Action
 */
export default function quoteReducer(state: QuoteState = DEFAULT_STATE, action: Action): QuoteState {
    const reducer = combineReducers<QuoteState>({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: InternalQuote | undefined, action: Action): InternalQuote | undefined {
    switch (action.type) {
    case BillingAddressActionTypes.UpdateBillingAddressSucceeded:
    case CheckoutActionType.LoadCheckoutSucceeded:
    case ConsignmentActionTypes.CreateConsignmentsSucceeded:
    case ConsignmentActionTypes.UpdateConsignmentSucceeded:
        return action.payload ? { ...data, ...mapToInternalQuote(action.payload) } : data;

    case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
    case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
        return action.payload ? { ...data, ...action.payload.quote } : data;

    default:
        return data;
    }
}

function errorsReducer(errors: QuoteErrorsState = DEFAULT_STATE.errors, action: Action): QuoteErrorsState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
    case CheckoutActionType.LoadCheckoutSucceeded:
        return { ...errors, loadError: undefined };

    case CheckoutActionType.LoadCheckoutFailed:
        return { ...errors, loadError: action.payload };

    case BillingAddressActionTypes.UpdateBillingAddressRequested:
    case BillingAddressActionTypes.UpdateBillingAddressSucceeded:
        return { ...errors, updateBillingAddressError: undefined };

    case BillingAddressActionTypes.UpdateBillingAddressFailed:
        return { ...errors, updateBillingAddressError: action.payload };

    default:
        return errors;
    }
}

function statusesReducer(statuses: QuoteStatusesState = DEFAULT_STATE.statuses, action: Action): QuoteStatusesState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
        return { ...statuses, isLoading: true };

    case CheckoutActionType.LoadCheckoutSucceeded:
    case CheckoutActionType.LoadCheckoutFailed:
        return { ...statuses, isLoading: false };

    case BillingAddressActionTypes.UpdateBillingAddressRequested:
        return { ...statuses, isUpdatingBillingAddress: true };

    case BillingAddressActionTypes.UpdateBillingAddressFailed:
    case BillingAddressActionTypes.UpdateBillingAddressSucceeded:
        return { ...statuses, isUpdatingBillingAddress: false };

    default:
        return statuses;
    }
}
