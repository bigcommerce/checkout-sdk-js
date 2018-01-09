import { getBillingAddressResponseBody } from '../billing/billing-address.mock';
import { getCustomerResponseBody } from '../customer/customers.mock';
import { getErrorResponseBody } from '../common/http-request/responses.mock';
import { getQuote, getQuoteResponseBody } from './quotes.mock';
import { getShippingAddressResponseBody } from '../shipping/shipping-address.mock';
import { getShippingOptionResponseBody } from '../shipping/shipping-options.mock';
import * as billingAddressActionTypes from '../billing/billing-address-action-types';
import * as customerActionTypes from '../customer/customer-action-types';
import * as quoteActionTypes from './quote-action-types';
import * as shippingAddressActionTypes from '../shipping/shipping-address-action-types';
import * as shippingOptionActionTypes from '../shipping/shipping-option-action-types';
import quoteReducer from './quote-reducer';

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

    it('returns new data if quote is fetched successfully', () => {
        const response = getQuoteResponseBody();
        const action = {
            type: quoteActionTypes.LOAD_QUOTE_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };

        expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
            meta: expect.objectContaining({
                request: action.meta.request,
            }),
            data: action.payload.quote,
            statuses: { isLoading: false },
        }));
    });

    it('returns new data if quote is not fetched successfully', () => {
        const action = {
            type: quoteActionTypes.LOAD_QUOTE_FAILED,
            payload: getErrorResponseBody(),
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

    it('returns new data when shipping options gets updated', () => {
        const response = getShippingOptionResponseBody();
        const action = {
            type: shippingOptionActionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };

        expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.quote,
        }));
    });

    it('returns new data when shipping options gets selected', () => {
        const response = getShippingOptionResponseBody();
        const action = {
            type: shippingOptionActionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED,
            meta: response.meta,
            payload: response.data,
        };

        expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
            data: action.payload.quote,
        }));
    });

    describe('when updating shipping address', () => {
        it('sets updating flag to true while updating', () => {
            const action = {
                type: shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_REQUESTED,
            };

            expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
                statuses: { isUpdatingShippingAddress: true },
            }));
        });

        it('cleans errors while updating', () => {
            const action = {
                type: shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_REQUESTED,
            };

            initialState.errors = {
                updateShippingAddressError: getErrorResponseBody(),
            };

            expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
                errors: {
                    updateShippingAddressError: undefined,
                },
            }));
        });

        it('saves the payload when update succeeds', () => {
            const response = getShippingAddressResponseBody();
            const action = {
                type: shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_SUCCEEDED,
                payload: response.data,
            };

            expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
                data: action.payload.quote,
            }));
        });

        it('sets updating flag to false when update succeeds', () => {
            const action = {
                type: shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_SUCCEEDED,
                payload: getErrorResponseBody(),
            };

            expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
                statuses: { isUpdatingShippingAddress: false },
            }));
        });

        it('cleans errors when update succeeds', () => {
            const action = {
                type: shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_SUCCEEDED,
            };

            initialState.errors = {
                updateShippingAddressError: getErrorResponseBody(),
            };

            expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
                errors: {
                    updateShippingAddressError: undefined,
                },
            }));
        });

        it('saves the error when update fails', () => {
            const action = {
                type: shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_FAILED,
                payload: getErrorResponseBody(),
            };

            expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
                errors: { updateShippingAddressError: action.payload },
            }));
        });

        it('sets the updating flag to false when update fails', () => {
            const action = {
                type: shippingAddressActionTypes.UPDATE_SHIPPING_ADDRESS_FAILED,
                payload: getErrorResponseBody(),
            };

            expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
                errors: { updateShippingAddressError: action.payload },
            }));
        });
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
                updateBillingAddressError: getErrorResponseBody(),
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
                payload: getErrorResponseBody(),
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
                updateBillingAddressError: getErrorResponseBody(),
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
                payload: getErrorResponseBody(),
            };

            expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
                errors: { updateBillingAddressError: action.payload },
            }));
        });

        it('sets the updating flag to false when update fails', () => {
            const action = {
                type: billingAddressActionTypes.UPDATE_BILLING_ADDRESS_FAILED,
                payload: getErrorResponseBody(),
            };

            expect(quoteReducer(initialState, action)).toEqual(expect.objectContaining({
                errors: { updateBillingAddressError: action.payload },
            }));
        });
    });
});
