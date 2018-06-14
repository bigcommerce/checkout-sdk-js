import { getCustomerResponseBody, getGuestCustomer } from './internal-customers.mock';
import { CustomerActionType } from './customer-actions';
import customerReducer from './customer-reducer';

import { OrderActionType } from '../order';
import { getCompleteOrderResponseBody } from '../order/internal-orders.mock';
import { getQuoteResponseBody } from '../quote/internal-quotes.mock';
import { CheckoutActionType } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';
import { BillingAddressActionType } from '../billing/billing-address-actions';

describe('customerReducer()', () => {
    let initialState;

    beforeEach(() => {
        initialState = {};
    });

    it('returns new state with customer data when checkout is loaded successfully', () => {
        const response = getQuoteResponseBody();
        const action = {
            type: CheckoutActionType.LoadCheckoutSucceeded,
            meta: response.meta,
            payload: getCheckout(),
        };

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getGuestCustomer(),
        }));
    });

    it('returns new state with customer data when billing address is updated successfully', () => {
        const response = getQuoteResponseBody();
        const action = {
            type: BillingAddressActionType.UpdateBillingAddressSucceeded,
            meta: response.meta,
            payload: getCheckout(),
        };

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getGuestCustomer(),
        }));
    });

    it('returns new customer data if order is submitted successfully', () => {
        const response = getCompleteOrderResponseBody();
        const action = {
            type: OrderActionType.SubmitOrderSucceeded,
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
            type: OrderActionType.SubmitOrderSucceeded,
            meta: response.meta,
            payload: response.data,
        };

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.customer,
        }));
    });

    it('returns new customer data if customer has signed in successfully', () => {
        const action = {
            type: CustomerActionType.SignInCustomerSucceeded,
            payload: getCustomerResponseBody().data,
        };

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.customer,
        }));
    });

    it('returns new customer data if customer has signed out successfully', () => {
        const action = {
            type: CustomerActionType.SignOutCustomerSucceeded,
            payload: getCustomerResponseBody().data,
        };

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.customer,
        }));
    });
});
