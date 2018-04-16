import { getCheckout } from '../checkout/checkouts.mock';
import { getErrorResponse } from '../common/http-request/responses.mock';
import * as customerActionTypes from '../customer/customer-action-types';
import { getCustomerResponseBody } from '../customer/internal-customers.mock';
import { getQuoteResponseBody } from '../quote/internal-quotes.mock';
import * as quoteActionTypes from '../quote/quote-action-types';
import { ConsignmentActionTypes } from '../shipping/consignment-actions';
import { getShippingOptionResponseBody, getShippingOptions } from '../shipping/internal-shipping-options.mock';
import * as shippingOptionActionTypes from '../shipping/shipping-option-action-types';
import shippingOptionReducer from './shipping-option-reducer';

describe('shippingOptionReducer()', () => {
    let initialState;

    beforeEach(() => {
        initialState = {
            meta: {},
            data: {},
        };
    });

    it('returns a new state with shipping options data and loading flag set to false', () => {
        const response = getQuoteResponseBody();
        const action = {
            type: quoteActionTypes.LOAD_QUOTE_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };

        expect(shippingOptionReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.shippingOptions,
        }));
    });

    it('returns new shipping option data if customer has signed in successfully', () => {
        const action = {
            type: customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED,
            payload: getCustomerResponseBody().data,
        };

        expect(shippingOptionReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.shippingOptions,
        }));
    });

    it('returns new shipping option data if customer has signed out successfully', () => {
        const action = {
            type: customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED,
            payload: getCustomerResponseBody().data,
        };

        expect(shippingOptionReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.shippingOptions,
        }));
    });

    it('returns a loading state if fetching shipping options', () => {
        const action = {
            type: shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_REQUESTED,
        };

        expect(shippingOptionReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { loadError: undefined },
            statuses: { isLoading: true },
        }));
    });

    it('returns new shipping option data if it loads correctly', () => {
        const action = {
            type: shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED,
            payload: getShippingOptionResponseBody().data,
        };

        expect(shippingOptionReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.shippingOptions,
        }));
    });

    it('returns an error state if shipping options can not be fetched', () => {
        const action = {
            type: shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_FAILED,
            payload: getErrorResponse(),
        };

        expect(shippingOptionReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        }));
    });

    it('returns new shipping option data when a selection succedes', () => {
        const action = {
            type: shippingOptionActionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED,
            payload: getShippingOptionResponseBody().data,
        };

        expect(shippingOptionReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.shippingOptions,
        }));
    });

    it('returns a new state when updating shipping address', () => {
        const action = {
            type: ConsignmentActionTypes.CreateConsignmentsSucceeded,
            payload: getCheckout(),
        };

        expect(shippingOptionReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getShippingOptions(),
        }));
    });
});
