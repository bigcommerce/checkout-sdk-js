import { BillingAddressActionTypes } from '../billing/billing-address-actions';
import { CheckoutActionType } from '../checkout';
import { CustomerActionType } from '../customer';
import { getCheckout } from '../checkout/checkouts.mock';
import { getErrorResponse } from '../common/http-request/responses.mock';
import { getCustomerResponseBody } from '../customer/internal-customers.mock';
import { ConsignmentActionTypes } from '../shipping/consignment-actions';
import { getQuote } from './internal-quotes.mock';
import quoteReducer from './quote-reducer';

describe('quoteReducer()', () => {
    let initialState;

    beforeEach(() => {
        initialState = {};
    });

    it('returns new data if customer has signed in successfully', () => {
        const action = {
            type: CustomerActionType.SignOutCustomerSucceeded,
            payload: getCustomerResponseBody().data,
        };

        expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.quote,
        }));
    });

    it('returns new data if customer has signed out successfully', () => {
        const action = {
            type: CustomerActionType.SignOutCustomerSucceeded,
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
                type: BillingAddressActionTypes.UpdateBillingAddressRequested,
            };

            expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
                statuses: { isUpdatingBillingAddress: true },
            }));
        });

        it('cleans errors while updating', () => {
            const action = {
                type: BillingAddressActionTypes.UpdateBillingAddressRequested,
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
            const action = {
                type: BillingAddressActionTypes.UpdateBillingAddressSucceeded,
                payload: getCheckout(),
            };

            expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
                data: getQuote(),
            }));
        });

        it('sets updating flag to false if succeeded', () => {
            const action = {
                type: BillingAddressActionTypes.UpdateBillingAddressSucceeded,
                payload: getCheckout(),
            };

            expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
                statuses: { isUpdatingBillingAddress: false },
            }));
        });

        it('cleans errors when update succeeds', () => {
            const action = {
                type: BillingAddressActionTypes.UpdateBillingAddressSucceeded,
                payload: getCheckout(),
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
                type: BillingAddressActionTypes.UpdateBillingAddressFailed,
                payload: getErrorResponse(),
            };

            expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
                errors: { updateBillingAddressError: action.payload },
            }));
        });

        it('sets the updating flag to false when update fails', () => {
            const action = {
                type: BillingAddressActionTypes.UpdateBillingAddressFailed,
                payload: getErrorResponse(),
            };

            expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
                errors: { updateBillingAddressError: action.payload },
            }));
        });
    });
});
