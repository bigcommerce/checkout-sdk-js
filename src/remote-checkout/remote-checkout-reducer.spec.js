import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { getRemoteBillingResponseBody, getRemoteShippingResponseBody, getRemotePaymentResponseBody, getRemoteCheckoutMeta } from './remote-checkout.mock';
import * as actionTypes from './remote-checkout-action-types';
import remoteCheckoutReducer from './remote-checkout-reducer';

describe('remoteCheckoutReducer', () => {
    it('returns state with billing address', () => {
        const response = getResponse(getRemoteBillingResponseBody());
        const action = {
            type: actionTypes.INITIALIZE_REMOTE_BILLING_SUCCEEDED,
            payload: response.body,
            meta: { methodId: 'amazon' },
        };

        expect(remoteCheckoutReducer({}, action))
            .toEqual(expect.objectContaining({
                data: {
                    billingAddress: response.body.billing.address,
                },
                errors: {
                    failedBillingMethod: undefined,
                    initializeBillingError: undefined,
                },
                statuses: {
                    loadingBillingMethod: undefined,
                    isInitializingBilling: false,
                },
            }));
    });

    it('returns state with error if failed to initialize billing', () => {
        const response = getErrorResponse();
        const action = {
            type: actionTypes.INITIALIZE_REMOTE_BILLING_FAILED,
            payload: response,
            meta: { methodId: 'amazon' },
        };

        expect(remoteCheckoutReducer({}, action))
            .toEqual(expect.objectContaining({
                errors: {
                    failedBillingMethod: 'amazon',
                    initializeBillingError: response,
                },
                statuses: {
                    isInitializingBilling: false,
                    loadingBillingMethod: undefined,
                },
            }));
    });

    it('returns state with loading flag if waiting to initialize billing', () => {
        const response = getErrorResponse();
        const action = {
            type: actionTypes.INITIALIZE_REMOTE_BILLING_REQUESTED,
            payload: response,
            meta: { methodId: 'amazon' },
        };

        expect(remoteCheckoutReducer({}, action))
            .toEqual(expect.objectContaining({
                statuses: {
                    isInitializingBilling: true,
                    loadingBillingMethod: 'amazon',
                },
            }));
    });

    it('returns state with shipping address', () => {
        const response = getResponse(getRemoteShippingResponseBody());
        const action = {
            type: actionTypes.INITIALIZE_REMOTE_SHIPPING_SUCCEEDED,
            payload: response.body,
            meta: { methodId: 'amazon' },
        };

        expect(remoteCheckoutReducer({}, action))
            .toEqual(expect.objectContaining({
                data: {
                    shippingAddress: response.body.shipping.address,
                },
                errors: {
                    failedShippingMethod: undefined,
                    initializeShippingError: undefined,
                },
                statuses: {
                    isInitializingShipping: false,
                    loadingShippingMethod: undefined,
                },
            }));
    });

    it('returns state with error if failed to initialize shipping', () => {
        const response = getErrorResponse();
        const action = {
            type: actionTypes.INITIALIZE_REMOTE_SHIPPING_FAILED,
            payload: response,
            meta: { methodId: 'amazon' },
        };

        expect(remoteCheckoutReducer({}, action))
            .toEqual(expect.objectContaining({
                errors: {
                    failedShippingMethod: 'amazon',
                    initializeShippingError: response,
                },
                statuses: {
                    isInitializingShipping: false,
                    loadingShippingMethod: undefined,
                },
            }));
    });

    it('returns state with loading flag if waiting to initialize shipping', () => {
        const response = getErrorResponse();
        const action = {
            type: actionTypes.INITIALIZE_REMOTE_SHIPPING_REQUESTED,
            payload: response,
            meta: { methodId: 'amazon' },
        };

        expect(remoteCheckoutReducer({}, action))
            .toEqual(expect.objectContaining({
                statuses: {
                    isInitializingShipping: true,
                    loadingShippingMethod: 'amazon',
                },
            }));
    });

    it('returns state with payment initialization result', () => {
        const response = getResponse(getRemotePaymentResponseBody());
        const action = {
            type: actionTypes.INITIALIZE_REMOTE_PAYMENT_SUCCEEDED,
            payload: response.body,
            meta: { methodId: 'amazon' },
        };

        expect(remoteCheckoutReducer({}, action))
            .toEqual(expect.objectContaining({
                data: {
                    isPaymentInitialized: response.body.payment,
                },
                errors: {
                    failedPaymentMethod: undefined,
                    initializePaymentError: undefined,
                },
                statuses: {
                    isInitializingPayment: false,
                    loadingPaymentMethod: undefined,
                },
            }));
    });

    it('returns state with error if failed to initialize payment', () => {
        const response = getErrorResponse();
        const action = {
            type: actionTypes.INITIALIZE_REMOTE_PAYMENT_FAILED,
            payload: response,
            meta: { methodId: 'amazon' },
        };

        expect(remoteCheckoutReducer({}, action))
            .toEqual(expect.objectContaining({
                errors: {
                    failedPaymentMethod: 'amazon',
                    initializePaymentError: response,
                },
                statuses: {
                    isInitializingPayment: false,
                    loadingPaymentMethod: undefined,
                },
            }));
    });

    it('returns state with loading flag if waiting to initialize payment', () => {
        const response = getErrorResponse();
        const action = {
            type: actionTypes.INITIALIZE_REMOTE_PAYMENT_REQUESTED,
            payload: response,
            meta: { methodId: 'amazon' },
        };

        expect(remoteCheckoutReducer({}, action))
            .toEqual(expect.objectContaining({
                statuses: {
                    isInitializingPayment: true,
                    loadingPaymentMethod: 'amazon',
                },
            }));
    });

    it('returns state with meta data', () => {
        const action = {
            type: actionTypes.SET_REMOTE_CHECKOUT_META,
            payload: getRemoteCheckoutMeta(),
        };

        expect(remoteCheckoutReducer({}, action))
            .toEqual(expect.objectContaining({
                meta: getRemoteCheckoutMeta(),
            }));
    });
});
