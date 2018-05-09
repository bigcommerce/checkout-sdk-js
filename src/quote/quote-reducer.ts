import { combineReducers, Action } from '@bigcommerce/data-store';

import * as billingAddressActionTypes from '../billing/billing-address-action-types';
import { CheckoutActionType } from '../checkout';
import * as customerActionTypes from '../customer/customer-action-types';
import * as shippingAddressActionTypes from '../shipping/shipping-address-action-types';
import * as shippingOptionActionTypes from '../shipping/shipping-option-action-types';

import InternalQuote from './internal-quote';
import mapToInternalQuote from './map-to-internal-quote';
import * as quoteActionTypes from './quote-action-types';
import QuoteState, { QuoteErrorsState, QuoteMetaState, QuoteStatusesState } from './quote-state';

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
        meta: metaReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: InternalQuote | undefined, action: Action): InternalQuote | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return data ? { ...data, ...mapToInternalQuote(action.payload, data) } : data;

    case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED:
    case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
    case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
    case shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_SUCCEEDED:
    case shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED:
    case shippingOptionActionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED:
        return action.payload ? { ...data, ...action.payload.quote } : data;

    default:
        return data;
    }
}

function metaReducer(meta: QuoteMetaState | undefined, action: Action): QuoteMetaState | undefined {
    switch (action.type) {
    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
        return action.meta ? { ...meta, ...action.meta } : meta;

    default:
        return meta;
    }
}

function errorsReducer(errors: QuoteErrorsState = DEFAULT_STATE.errors, action: Action): QuoteErrorsState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
    case CheckoutActionType.LoadCheckoutSucceeded:
    case quoteActionTypes.LOAD_QUOTE_REQUESTED:
    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
        return { ...errors, loadError: undefined };

    case CheckoutActionType.LoadCheckoutFailed:
    case quoteActionTypes.LOAD_QUOTE_FAILED:
        return { ...errors, loadError: action.payload };

    case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_REQUESTED:
    case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED:
        return { ...errors, updateBillingAddressError: undefined };

    case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_FAILED:
        return { ...errors, updateBillingAddressError: action.payload };

    default:
        return errors;
    }
}

function statusesReducer(statuses: QuoteStatusesState = DEFAULT_STATE.statuses, action: Action): QuoteStatusesState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
    case quoteActionTypes.LOAD_QUOTE_REQUESTED:
        return { ...statuses, isLoading: true };

    case CheckoutActionType.LoadCheckoutSucceeded:
    case CheckoutActionType.LoadCheckoutFailed:
    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
    case quoteActionTypes.LOAD_QUOTE_FAILED:
        return { ...statuses, isLoading: false };

    case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_REQUESTED:
        return { ...statuses, isUpdatingBillingAddress: true };

    case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED:
    case billingAddressActionTypes.UPDATE_BILLING_ADDRESS_FAILED:
        return { ...statuses, isUpdatingBillingAddress: false };

    default:
        return statuses;
    }
}
