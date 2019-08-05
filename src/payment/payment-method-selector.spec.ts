import { CheckoutStoreState } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';
import { RequestError } from '../common/error/errors';
import { getErrorResponse } from '../common/http-request/responses.mock';

import PaymentMethodSelector, { createPaymentMethodSelectorFactory, PaymentMethodSelectorFactory } from './payment-method-selector';
import { getAdyenAmex, getBraintree } from './payment-methods.mock';

describe('PaymentMethodSelector', () => {
    let createPaymentMethodSelector: PaymentMethodSelectorFactory;
    let paymentMethodSelector: PaymentMethodSelector;
    let state: CheckoutStoreState;

    beforeEach(() => {
        createPaymentMethodSelector = createPaymentMethodSelectorFactory();
        state = getCheckoutStoreState();
    });

    describe('#getPaymentMethods()', () => {
        it('returns a list of payment methods', () => {
            paymentMethodSelector = createPaymentMethodSelector(state.paymentMethods);

            expect(paymentMethodSelector.getPaymentMethods()).toEqual(state.paymentMethods.data);
        });

        it('returns an empty array if there are no payment methods', () => {
            paymentMethodSelector = createPaymentMethodSelector({
                ...state.paymentMethods,
                data: [],
            });

            expect(paymentMethodSelector.getPaymentMethods()).toEqual([]);
        });
    });

    describe('#getPaymentMethod()', () => {
        it('returns payment method if found', () => {
            paymentMethodSelector = createPaymentMethodSelector(state.paymentMethods);

            expect(paymentMethodSelector.getPaymentMethod('braintree')).toEqual(getBraintree());
        });

        it('returns multi-option payment method if found', () => {
            paymentMethodSelector = createPaymentMethodSelector(state.paymentMethods);

            expect(paymentMethodSelector.getPaymentMethod('amex', 'adyen')).toEqual(getAdyenAmex());
        });

        it('returns nothing if payment method is not found', () => {
            paymentMethodSelector = createPaymentMethodSelector(state.paymentMethods);

            expect(paymentMethodSelector.getPaymentMethod('xyz')).toBeUndefined();
        });

        it('returns nothing if multi-option payment method is not found', () => {
            paymentMethodSelector = createPaymentMethodSelector(state.paymentMethods);

            expect(paymentMethodSelector.getPaymentMethod('amex')).toEqual(getAdyenAmex());
        });
    });

    describe('#getLoadError()', () => {
        it('returns error if unable to load', () => {
            const loadError = new RequestError(getErrorResponse());

            paymentMethodSelector = createPaymentMethodSelector({
                ...state.paymentMethods,
                errors: { loadError },
            });

            expect(paymentMethodSelector.getLoadError()).toEqual(loadError);
        });

        it('does not returns error if able to load', () => {
            paymentMethodSelector = createPaymentMethodSelector(state.paymentMethods);

            expect(paymentMethodSelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#getLoadMethodError()', () => {
        it('returns error if unable to load', () => {
            const loadMethodError = new RequestError(getErrorResponse());

            paymentMethodSelector = createPaymentMethodSelector({
                ...state.paymentMethods,
                errors: { loadMethodError, loadMethodId: 'braintree' },
            });

            expect(paymentMethodSelector.getLoadMethodError('braintree')).toEqual(loadMethodError);
        });

        it('does not returns error if able to load', () => {
            paymentMethodSelector = createPaymentMethodSelector(state.paymentMethods);

            expect(paymentMethodSelector.getLoadMethodError('braintree')).toBeUndefined();
        });

        it('does not returns error if unable to load irrelevant method', () => {
            const loadMethodError = new RequestError(getErrorResponse());

            paymentMethodSelector = createPaymentMethodSelector({
                ...state.paymentMethods,
                errors: { loadMethodError, loadMethodId: 'authorizenet' },
            });

            expect(paymentMethodSelector.getLoadMethodError('braintree')).toBeUndefined();
        });

        it('returns any error if method id is not passed', () => {
            const loadMethodError = new RequestError(getErrorResponse());

            paymentMethodSelector = createPaymentMethodSelector({
                ...state.paymentMethods,
                errors: { loadMethodError, loadMethodId: 'braintree' },
            });

            expect(paymentMethodSelector.getLoadMethodError()).toEqual(loadMethodError);
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading payment methods', () => {
            paymentMethodSelector = createPaymentMethodSelector({
                ...state.paymentMethods,
                statuses: { isLoading: true },
            });

            expect(paymentMethodSelector.isLoading()).toEqual(true);
        });

        it('returns false if not loading payment methods', () => {
            paymentMethodSelector = createPaymentMethodSelector(state.paymentMethods);

            expect(paymentMethodSelector.isLoading()).toEqual(false);
        });
    });

    describe('#isLoadingMethod()', () => {
        it('returns true if loading payment method', () => {
            paymentMethodSelector = createPaymentMethodSelector({
                ...state.paymentMethods,
                statuses: { isLoadingMethod: true, loadMethodId: 'braintree' },
            });

            expect(paymentMethodSelector.isLoadingMethod('braintree')).toEqual(true);
        });

        it('returns false if not loading payment method', () => {
            paymentMethodSelector = createPaymentMethodSelector({
                ...state.paymentMethods,
                statuses: { isLoadingMethod: false, loadMethodId: undefined },
            });

            expect(paymentMethodSelector.isLoadingMethod('braintree')).toEqual(false);
        });

        it('returns false if not loading specific payment method', () => {
            paymentMethodSelector = createPaymentMethodSelector({
                ...state.paymentMethods,
                statuses: { isLoadingMethod: true, loadMethodId: 'authorizenet' },
            });

            expect(paymentMethodSelector.isLoadingMethod('braintree')).toEqual(false);
        });

        it('returns any loading status if method id is not passed', () => {
            paymentMethodSelector = createPaymentMethodSelector({
                ...state.paymentMethods,
                statuses: { isLoadingMethod: true, loadMethodId: 'braintree' },
            });

            expect(paymentMethodSelector.isLoadingMethod()).toEqual(true);
        });
    });
});
