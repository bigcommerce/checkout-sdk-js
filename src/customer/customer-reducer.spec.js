import { getCustomerResponseBody } from './internal-customers.mock';
import { getCompleteOrderResponseBody } from '../order/internal-orders.mock';
import { getQuoteResponseBody } from '../quote/internal-quotes.mock';
import * as customerActionTypes from '../customer/customer-action-types';
import * as orderActionTypes from '../order/order-action-types';
import * as quoteActionTypes from '../quote/quote-action-types';
import customerReducer from './customer-reducer';

describe('customerReducer()', () => {
    let initialState;

    beforeEach(() => {
        initialState = {};
    });

    it('returns new state with customer data if quote is fetched successfully', () => {
        const response = getQuoteResponseBody();
        const action = {
            type: quoteActionTypes.LOAD_QUOTE_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.customer,
        }));
    });

    it('returns new customer data if order is fetched successfully', () => {
        const response = getCompleteOrderResponseBody();
        const action = {
            type: orderActionTypes.LOAD_ORDER_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.customer,
        }));
    });

    it('returns new customer data if order is submitted successfully', () => {
        const response = getCompleteOrderResponseBody();
        const action = {
            type: orderActionTypes.SUBMIT_ORDER_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.customer,
        }));
    });

    it('returns new customer data if order is finalized successfully', () => {
        const response = getCompleteOrderResponseBody();
        const action = {
            type: orderActionTypes.FINALIZE_ORDER_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.customer,
        }));
    });

    it('returns new customer data if customer has signed in successfully', () => {
        const action = {
            type: customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED,
            payload: getCustomerResponseBody().data,
        };

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.customer,
        }));
    });

    it('returns new customer data if customer has signed out successfully', () => {
        const action = {
            type: customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED,
            payload: getCustomerResponseBody().data,
        };

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.customer,
        }));
    });
});
