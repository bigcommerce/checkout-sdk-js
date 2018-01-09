import { find, merge } from 'lodash';
import { getAdyenAmex, getBraintree, getPaymentMethodsState } from './payment-methods.mock';
import { getSubmittedOrderState } from '../order/orders.mock';
import { getErrorResponse } from '../common/http-request/responses.mock';
import PaymentMethodSelector from './payment-method-selector';

describe('PaymentMethodSelector', () => {
    let paymentMethodSelector;
    let state;

    beforeEach(() => {
        state = {
            paymentMethods: getPaymentMethodsState(),
            order: getSubmittedOrderState(),
        };
    });

    describe('#getPaymentMethods()', () => {
        it('returns a list of payment methods', () => {
            paymentMethodSelector = new PaymentMethodSelector(state.paymentMethods, state.order);

            expect(paymentMethodSelector.getPaymentMethods()).toEqual(state.paymentMethods.data);
        });

        it('returns an empty array if there are no payment methods', () => {
            paymentMethodSelector = new PaymentMethodSelector({
                ...state.paymentMethods,
                data: [],
            }, state.order);

            expect(paymentMethodSelector.getPaymentMethods()).toEqual([]);
        });
    });

    describe('#getPaymentMethod()', () => {
        it('returns payment method if found', () => {
            paymentMethodSelector = new PaymentMethodSelector(state.paymentMethods, state.order);

            expect(paymentMethodSelector.getPaymentMethod('braintree')).toEqual(getBraintree());
        });

        it('returns multi-option payment method if found', () => {
            paymentMethodSelector = new PaymentMethodSelector(state.paymentMethods, state.order);

            expect(paymentMethodSelector.getPaymentMethod('amex', 'adyen')).toEqual(getAdyenAmex());
        });

        it('returns nothing if payment method is not found', () => {
            paymentMethodSelector = new PaymentMethodSelector(state.paymentMethods, state.order);

            expect(paymentMethodSelector.getPaymentMethod('xyz')).toBeUndefined();
        });

        it('returns nothing if multi-option payment method is not found', () => {
            paymentMethodSelector = new PaymentMethodSelector(state.paymentMethods, state.order);

            expect(paymentMethodSelector.getPaymentMethod('amex')).toEqual(getAdyenAmex());
        });
    });

    describe('#getSelectedPaymentMethod()', () => {
        it('returns selected payment method', () => {
            paymentMethodSelector = new PaymentMethodSelector(state.paymentMethods, state.order);

            expect(paymentMethodSelector.getSelectedPaymentMethod()).toEqual(
                find(state.paymentMethods.data, { id: state.order.data.payment.id })
            );
        });

        it('returns undefined if payment method is not selected', () => {
            paymentMethodSelector = new PaymentMethodSelector(state.paymentMethods, merge({}, state.order, {
                data: {
                    payment: null,
                },
            }));

            expect(paymentMethodSelector.getSelectedPaymentMethod()).toEqual();
        });
    });

    describe('#getLoadError()', () => {
        it('returns error if unable to load', () => {
            const loadError = getErrorResponse();

            paymentMethodSelector = new PaymentMethodSelector({
                ...state.paymentMethods,
                errors: { loadError },
            }, state.order);

            expect(paymentMethodSelector.getLoadError()).toEqual(loadError);
        });

        it('does not returns error if able to load', () => {
            paymentMethodSelector = new PaymentMethodSelector(state.paymentMethods, state.order);

            expect(paymentMethodSelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#getLoadMethodError()', () => {
        it('returns error if unable to load', () => {
            const loadMethodError = getErrorResponse();

            paymentMethodSelector = new PaymentMethodSelector({
                ...state.paymentMethods,
                errors: { loadMethodError, failedMethod: 'braintree' },
            }, state.order);

            expect(paymentMethodSelector.getLoadMethodError('braintree')).toEqual(loadMethodError);
        });

        it('does not returns error if able to load', () => {
            paymentMethodSelector = new PaymentMethodSelector(state.paymentMethods, state.order);

            expect(paymentMethodSelector.getLoadMethodError('braintree')).toBeUndefined();
        });

        it('does not returns error if unable to load irrelevant method', () => {
            const loadMethodError = getErrorResponse();

            paymentMethodSelector = new PaymentMethodSelector({
                ...state.paymentMethods,
                errors: { loadMethodError, failedMethod: 'authorizenet' },
            }, state.order);

            expect(paymentMethodSelector.getLoadMethodError('braintree')).toBeUndefined();
        });

        it('returns any error if method id is not passed', () => {
            const loadMethodError = getErrorResponse();

            paymentMethodSelector = new PaymentMethodSelector({
                ...state.paymentMethods,
                errors: { loadMethodError, failedMethod: 'braintree' },
            }, state.order);

            expect(paymentMethodSelector.getLoadMethodError()).toEqual(loadMethodError);
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading payment methods', () => {
            paymentMethodSelector = new PaymentMethodSelector({
                ...state.paymentMethods,
                statuses: { isLoading: true },
            }, state.order);

            expect(paymentMethodSelector.isLoading()).toEqual(true);
        });

        it('returns false if not loading payment methods', () => {
            paymentMethodSelector = new PaymentMethodSelector(state.paymentMethods, state.order);

            expect(paymentMethodSelector.isLoading()).toEqual(false);
        });
    });

    describe('#isLoadingMethod()', () => {
        it('returns true if loading payment method', () => {
            paymentMethodSelector = new PaymentMethodSelector({
                ...state.paymentMethods,
                statuses: { isLoadingMethod: true, loadingMethod: 'braintree' },
            }, state.order);

            expect(paymentMethodSelector.isLoadingMethod('braintree')).toEqual(true);
        });

        it('returns false if not loading payment method', () => {
            paymentMethodSelector = new PaymentMethodSelector({
                ...state.paymentMethods,
                statuses: { isLoadingMethod: false, loadingMethod: undefined },
            }, state.order);

            expect(paymentMethodSelector.isLoadingMethod('braintree')).toEqual(false);
        });

        it('returns false if not loading specific payment method', () => {
            paymentMethodSelector = new PaymentMethodSelector({
                ...state.paymentMethods,
                statuses: { isLoadingMethod: true, loadingMethod: 'authorizenet' },
            }, state.order);

            expect(paymentMethodSelector.isLoadingMethod('braintree')).toEqual(false);
        });

        it('returns any loading status if method id is not passed', () => {
            paymentMethodSelector = new PaymentMethodSelector({
                ...state.paymentMethods,
                statuses: { isLoadingMethod: true, loadingMethod: 'braintree' },
            }, state.order);

            expect(paymentMethodSelector.isLoadingMethod()).toEqual(true);
        });
    });
});
