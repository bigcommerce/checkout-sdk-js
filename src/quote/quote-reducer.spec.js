import * as billingAddressActionTypes from '../billing/billing-address-action-types';
import { getBillingAddressResponseBody } from '../billing/internal-billing-addresses.mock';
import { getCheckout } from '../checkout/checkouts.mock';
import { getErrorResponse } from '../common/http-request/responses.mock';
import * as customerActionTypes from '../customer/customer-action-types';
import { getCustomerResponseBody } from '../customer/internal-customers.mock';
import { ConsignmentActionTypes } from '../shipping/consignment-actions';
import { getQuote } from './internal-quotes.mock';
import * as quoteActionTypes from './quote-action-types';
import quoteReducer from './quote-reducer';
import { CheckoutActionType } from '../checkout';

describe('quoteReducer()', () => {
    let initialState;

    beforeEach(() => {
        initialState = {
            data: getQuote(),
        };
    });

    it('returns a new state with loading flag set to true', () => {
        const action = {
            type: quoteActionTypes.LOAD_QUOTE_REQUESTED,
        };

        expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
            ...initialState,
            statuses: { isLoading: true },
        }));
    });

    it('returns new data while fetching quote', () => {
        const action = {
            type: quoteActionTypes.LOAD_QUOTE_REQUESTED,
        };

        expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isLoading: true },
        }));
    });

    it('returns new data if quote is not fetched successfully', () => {
        const action = {
            type: quoteActionTypes.LOAD_QUOTE_FAILED,
            payload: getErrorResponse(),
        };

        expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
            ...initialState,
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        }));
    });

    it('returns new data if customer has signed in successfully', () => {
        const action = {
            type: customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED,
            payload: getCustomerResponseBody().data,
        };

        expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.quote,
        }));
    });

    it('returns new data if customer has signed out successfully', () => {
        const action = {
            type: customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED,
            payload: getCustomerResponseBody().data,
        };

        expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.quote,
        }));
    });

    it('returns new data when checkout is loaded', () => {
        const action = {
            type: CheckoutActionType.LoadCheckoutSucceeded,
            payload: getCheckout(),
        };

        expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getQuote(),
        }));
    });

    it('returns new data when creating consignments', () => {
        const action = {
            type: ConsignmentActionTypes.CreateConsignmentsSucceeded,
            payload: getCheckout(),
        };

        expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getQuote(),
        }));
    });

    it('returns new data when updating a consignment', () => {
        const action = {
            type: ConsignmentActionTypes.UpdateConsignmentSucceeded,
            payload: getCheckout(),
        };

        expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getQuote(),
        }));
    });

    describe('when updating billing address', () => {
        it('sets updating flag to true while updating', () => {
            const action = {
                type: billingAddressActionTypes.UPDATE_BILLING_ADDRESS_REQUESTED,
            };

            expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
                statuses: { isUpdatingBillingAddress: true },
            }));
        });

        it('cleans errors while updating', () => {
            const action = {
                type: billingAddressActionTypes.UPDATE_BILLING_ADDRESS_REQUESTED,
            };

            initialState.errors = {
                updateBillingAddressError: getErrorResponse(),
            };

            expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
                errors: {
                    updateBillingAddressError: undefined,
                },
            }));
        });

        it('saves the payload when update succeeds', () => {
            const response = getBillingAddressResponseBody();
            const action = {
                type: billingAddressActionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED,
                payload: response.data,
            };

            expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
                data: action.payload.quote,
            }));
        });

        it('sets updating flag to false if succeeded', () => {
            const action = {
                type: billingAddressActionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED,
                payload: getErrorResponse(),
            };

            expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
                statuses: { isUpdatingBillingAddress: false },
            }));
        });

        it('cleans errors when update succeeds', () => {
            const action = {
                type: billingAddressActionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED,
            };

            initialState.errors = {
                updateBillingAddressError: getErrorResponse(),
            };

            expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
                errors: {
                    updateBillingAddressError: undefined,
                },
            }));
        });

        it('saves the error when update fails', () => {
            const action = {
                type: billingAddressActionTypes.UPDATE_BILLING_ADDRESS_FAILED,
                payload: getErrorResponse(),
            };

            expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
                errors: { updateBillingAddressError: action.payload },
            }));
        });

        it('sets the updating flag to false when update fails', () => {
            const action = {
                type: billingAddressActionTypes.UPDATE_BILLING_ADDRESS_FAILED,
                payload: getErrorResponse(),
            };

            expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
                errors: { updateBillingAddressError: action.payload },
            }));
        });
    });
});
