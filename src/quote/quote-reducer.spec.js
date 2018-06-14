import { CheckoutActionType } from '../checkout';
import { CustomerActionType } from '../customer';
import { getCheckout } from '../checkout/checkouts.mock';
import { getCustomerResponseBody } from '../customer/internal-customers.mock';
import { ConsignmentActionType } from '../shipping/consignment-actions';
import { getQuote } from './internal-quotes.mock';
import quoteReducer from './quote-reducer';

describe('quoteReducer()', () => {
    let initialState;
    const quoteState = {
        data: {
            ...getQuote(),
            billingAddress: {},
        },
    };

    beforeEach(() => {
        initialState = {};
    });

    it('returns new data if customer has signed in successfully', () => {
        const action = {
            type: CustomerActionType.SignOutCustomerSucceeded,
            payload: getCustomerResponseBody().data,
        };

        expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getQuote(),
        }));
    });

    it('returns new data if customer has signed out successfully', () => {
        const action = {
            type: CustomerActionType.SignOutCustomerSucceeded,
            payload: getCustomerResponseBody().data,
        };

        expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getQuote(),
        }));
    });

    it('returns new data when checkout is loaded', () => {
        const action = {
            type: CheckoutActionType.LoadCheckoutSucceeded,
            payload: getCheckout(),
        };

        expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining(quoteState));
    });

    it('returns new data when creating consignments', () => {
        const action = {
            type: ConsignmentActionType.CreateConsignmentsSucceeded,
            payload: getCheckout(),
        };

        expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining(quoteState));
    });

    it('returns new data when updating a consignment', () => {
        const action = {
            type: ConsignmentActionType.UpdateConsignmentSucceeded,
            payload: getCheckout(),
        };

        expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining(quoteState));
    });
});
