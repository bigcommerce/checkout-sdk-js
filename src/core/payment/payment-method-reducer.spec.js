import { getBraintreePaypal, getPaymentMethod, getPaymentMethodResponseBody, getPaymentMethodsResponseBody } from './payment-methods.mock';
import { getErrorResponseBody } from '../common/error/errors.mock';
import paymentMethodReducer from './payment-method-reducer';
import * as actionTypes from './payment-method-action-types';

describe('paymentMethodReducer()', () => {
    let initialState;

    beforeEach(() => {
        initialState = {
            data: [],
        };
    });

    it('returns new state when loading payment methods', () => {
        const action = {
            type: actionTypes.LOAD_PAYMENT_METHODS_REQUESTED,
        };

        expect(paymentMethodReducer(initialState, action)).toEqual({
            ...initialState,
            errors: {},
            statuses: { isLoading: true },
        });
    });

    it('returns new state when payment methods are loaded', () => {
        const response = getPaymentMethodsResponseBody();
        const action = {
            type: actionTypes.LOAD_PAYMENT_METHODS_SUCCEEDED,
            payload: response.data,
        };

        expect(paymentMethodReducer(initialState, action)).toEqual({
            ...initialState,
            data: action.payload.paymentMethods,
            errors: { loadError: undefined },
            statuses: { isLoading: false },
        });
    });

    it('returns new state when payment methods cannot be loaded', () => {
        const action = {
            type: actionTypes.LOAD_PAYMENT_METHODS_FAILED,
            payload: getErrorResponseBody(),
        };

        expect(paymentMethodReducer(initialState, action)).toEqual({
            ...initialState,
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        });
    });

    it('returns new state when payment method is loaded', () => {
        const response = getPaymentMethodResponseBody();
        const action = {
            type: actionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED,
            payload: response.data,
            meta: { methodId: 'braintree' },
        };

        expect(paymentMethodReducer(initialState, action)).toEqual({
            ...initialState,
            data: [
                action.payload.paymentMethod,
            ],
            errors: {
                failedMethod: undefined,
                loadMethodError: undefined,
            },
            statuses: {
                isLoadingMethod: false,
                loadingMethod: undefined,
            },
        });
    });

    it('returns new state when payment method cannot be loaded', () => {
        const action = {
            type: actionTypes.LOAD_PAYMENT_METHOD_FAILED,
            payload: getErrorResponseBody(),
            meta: { methodId: 'braintree' },
        };

        expect(paymentMethodReducer(initialState, action)).toEqual({
            ...initialState,
            data: [],
            errors: {
                failedMethod: 'braintree',
                loadMethodError: getErrorResponseBody(),
            },
            statuses: {
                isLoadingMethod: false,
                loadingMethod: undefined,
            },
        });
    });

    it('returns new state when payment method is loaded and merged with existing payment methods', () => {
        const response = getPaymentMethodResponseBody();
        const action = {
            type: actionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED,
            payload: {
                ...response.data,
                paymentMethod: {
                    ...response.data.paymentMethod,
                    clientToken: '8e738db9-6477-4c92-888e-bea8f1311339',
                },
            },
        };

        initialState = {
            data: [
                getPaymentMethod(),
                getBraintreePaypal(),
            ],
        };

        expect(paymentMethodReducer(initialState, action)).toEqual(expect.objectContaining({
            ...initialState,
            data: [
                action.payload.paymentMethod,
                getBraintreePaypal(),
            ],
        }));
    });
});
