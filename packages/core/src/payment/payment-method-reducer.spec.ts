import { getErrorResponse } from '../common/http-request/responses.mock';

import { PaymentMethodActionType } from './payment-method-actions';
import paymentMethodReducer from './payment-method-reducer';
import PaymentMethodState from './payment-method-state';
import { getBraintreePaypal, getPaymentMethod, getPaymentMethods, getPaymentMethodsMeta } from './payment-methods.mock';

describe('paymentMethodReducer()', () => {
    let initialState: PaymentMethodState;

    beforeEach(() => {
        initialState = {
            data: [],
            errors: {},
            statuses: {},
        };
    });

    it('returns new state when loading payment methods', () => {
        const action = {
            type: PaymentMethodActionType.LoadPaymentMethodsRequested,
        };

        expect(paymentMethodReducer(initialState, action)).toEqual({
            ...initialState,
            errors: {},
            statuses: { isLoading: true },
        });
    });

    it('returns new state when payment methods are loaded', () => {
        const action = {
            type: PaymentMethodActionType.LoadPaymentMethodsSucceeded,
            payload: getPaymentMethods(),
            meta: getPaymentMethodsMeta(),
        };

        expect(paymentMethodReducer(initialState, action)).toEqual({
            ...initialState,
            data: action.payload,
            meta: action.meta,
            errors: { loadError: undefined },
            statuses: { isLoading: false },
        });
    });

    it('returns new state when payment methods cannot be loaded', () => {
        const action = {
            type: PaymentMethodActionType.LoadPaymentMethodsFailed,
            payload: getErrorResponse(),
        };

        expect(paymentMethodReducer(initialState, action)).toEqual({
            ...initialState,
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        });
    });

    it('returns new state when payment method is loaded', () => {
        const response = getPaymentMethod();
        const action = {
            type: PaymentMethodActionType.LoadPaymentMethodSucceeded,
            payload: response,
            meta: { methodId: 'braintree' },
        };

        expect(paymentMethodReducer(initialState, action)).toEqual({
            ...initialState,
            data: [
                action.payload,
            ],
            errors: {
                loadMethodId: undefined,
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
            type: PaymentMethodActionType.LoadPaymentMethodFailed,
            payload: getErrorResponse(),
            meta: { methodId: 'braintree' },
        };

        expect(paymentMethodReducer(initialState, action)).toEqual({
            ...initialState,
            data: [],
            errors: {
                loadMethodId: 'braintree',
                loadMethodError: getErrorResponse(),
            },
            statuses: {
                isLoadingMethod: false,
                loadingMethod: undefined,
            },
        });
    });

    it('returns new state when payment method is loaded and merged with existing payment methods', () => {
        const response = getPaymentMethod();
        const action = {
            type: PaymentMethodActionType.LoadPaymentMethodSucceeded,
            payload: {
                ...response,
                clientToken: '8e738db9-6477-4c92-888e-bea8f1311339',
            },
        };

        initialState = {
            ...initialState,
            data: [
                getPaymentMethod(),
                getBraintreePaypal(),
            ],
        };

        expect(paymentMethodReducer(initialState, action)).toEqual(expect.objectContaining({
            data: [
                action.payload,
                getBraintreePaypal(),
            ],
        }));
    });
});
