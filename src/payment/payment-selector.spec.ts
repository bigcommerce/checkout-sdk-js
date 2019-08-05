import { merge } from 'lodash';

import { createInternalCheckoutSelectors, CheckoutStoreState, InternalCheckoutSelectors } from '../checkout';
import { getCheckoutStoreStateWithOrder, getCheckoutWithPayments } from '../checkout/checkouts.mock';
import { getCompleteOrder as getInternalCompleteOrder } from '../order/internal-orders.mock';

import { getPaymentMethod } from './payment-methods.mock';
import PaymentSelector, { createPaymentSelectorFactory, PaymentSelectorFactory } from './payment-selector';
import { ACKNOWLEDGE, FINALIZE } from './payment-status-types';

describe('PaymentSelector', () => {
    let createPaymentSelector: PaymentSelectorFactory;
    let state: CheckoutStoreState;
    let selectors: InternalCheckoutSelectors;
    let paymentSelector: PaymentSelector;

    beforeEach(() => {
        createPaymentSelector = createPaymentSelectorFactory();
        state = getCheckoutStoreStateWithOrder();
        selectors = createInternalCheckoutSelectors(state);
    });

    describe('#getPaymentId()', () => {
        it('returns payment ID from order if order has been created', () => {
            paymentSelector = createPaymentSelector(selectors.checkout, selectors.order);

            const payment = paymentSelector.getPaymentId();

            expect(payment && payment.providerId).toEqual('authorizenet');
        });

        it('returns payment ID from internal order if order has just been created before order is loaded', () => {
            selectors = createInternalCheckoutSelectors({
                ...state,
                order: {
                    ...state.order,
                    data: undefined,
                    meta: { payment: getInternalCompleteOrder().payment },
                },
            });
            paymentSelector = createPaymentSelector(selectors.checkout, selectors.order);

            const payment = paymentSelector.getPaymentId();

            expect(payment && payment.providerId).toEqual('authorizenet');
        });

        it('returns payment ID from checkout if order has not been created', () => {
            selectors = createInternalCheckoutSelectors({
                ...state,
                checkout: {
                    ...state.checkout,
                    data: getCheckoutWithPayments(),
                },
                order: {
                    ...state.order,
                    data: undefined,
                },
            });
            paymentSelector = createPaymentSelector(selectors.checkout, selectors.order);

            const payment = paymentSelector.getPaymentId();

            expect(payment && payment.providerId).toEqual('authorizenet');
        });
    });

    describe('#getPaymentStatus()', () => {
        it('returns payment status from order if order has been created', () => {
            paymentSelector = createPaymentSelector(selectors.checkout, selectors.order);

            expect(paymentSelector.getPaymentStatus()).toEqual(FINALIZE);
        });

        it('returns payment status from internal order if order has just been created before order is loaded', () => {
            selectors = createInternalCheckoutSelectors({
                ...state,
                order: {
                    ...state.order,
                    data: undefined,
                    meta: { payment: getInternalCompleteOrder().payment },
                },
            });
            paymentSelector = createPaymentSelector(selectors.checkout, selectors.order);

            expect(paymentSelector.getPaymentStatus()).toEqual(FINALIZE);
        });

        it('returns payment status from checkout if order has not been created', () => {
            selectors = createInternalCheckoutSelectors({
                ...state,
                checkout: {
                    ...state.checkout,
                    data: getCheckoutWithPayments(),
                },
                order: {
                    ...state.order,
                    data: undefined,
                    meta: undefined,
                },
            });
            paymentSelector = createPaymentSelector(selectors.checkout, selectors.order);

            expect(paymentSelector.getPaymentStatus()).toEqual(ACKNOWLEDGE);
        });
    });

    describe('#getPaymentRedirectUrl()', () => {
        it('returns redirect URL if available', () => {
            selectors = createInternalCheckoutSelectors({
                ...state,
                order: {
                    ...state.order,
                    data: undefined,
                    meta: {
                        payment: {
                            ...getInternalCompleteOrder().payment,
                            redirectUrl: '/checkout.php',
                        },
                    },
                },
            });
            paymentSelector = createPaymentSelector(selectors.checkout, selectors.order);

            expect(paymentSelector.getPaymentRedirectUrl()).toEqual('/checkout.php');
        });

        it('returns undefined if unavailable', () => {
            paymentSelector = createPaymentSelector(selectors.checkout, selectors.order);

            expect(paymentSelector.getPaymentRedirectUrl()).toEqual(undefined);
        });
    });

    describe('#getPaymentToken()', () => {
        it('returns payment token if available', () => {
            paymentSelector = createPaymentSelector(selectors.checkout, selectors.order);

            expect(paymentSelector.getPaymentToken()).toEqual(state.order.meta && state.order.meta.token);
        });

        it('returns undefined if unavailable', () => {
            selectors = createInternalCheckoutSelectors({
                ...state,
                order: {
                    ...state.order,
                    data: undefined,
                    meta: undefined,
                },
            });
            paymentSelector = createPaymentSelector(selectors.checkout, selectors.order);

            expect(paymentSelector.getPaymentToken()).toEqual(undefined);
        });
    });

    describe('#isPaymentDataRequired()', () => {
        it('returns true if payment is required', () => {
            paymentSelector = createPaymentSelector(selectors.checkout, selectors.order);

            expect(paymentSelector.isPaymentDataRequired()).toEqual(true);
        });

        it('returns false if store credit exceeds grand total', () => {
            selectors = createInternalCheckoutSelectors(merge({}, state, {
                customer: {
                    data: {
                        storeCredit: 100000000000,
                    },
                },
            }));
            paymentSelector = createPaymentSelector(selectors.checkout, selectors.order);

            expect(paymentSelector.isPaymentDataRequired(true)).toEqual(false);
        });

        it('returns true if store credit exceeds grand total but not using store credit', () => {
            selectors = createInternalCheckoutSelectors(merge({}, state, {
                customer: {
                    data: {
                        storeCredit: 100000000000,
                    },
                },
            }));
            paymentSelector = createPaymentSelector(selectors.checkout, selectors.order);

            expect(paymentSelector.isPaymentDataRequired(false)).toEqual(true);
        });
    });

    describe('#isPaymentDataSubmitted()', () => {
        it('returns true if payment is tokenized', () => {
            const paymentMethod = {
                ...getPaymentMethod(),
                nonce: '8903d867-6f7b-475c-8ab2-0b47ec6e000d',
            };
            paymentSelector = createPaymentSelector(selectors.checkout, selectors.order);

            expect(paymentSelector.isPaymentDataSubmitted(paymentMethod)).toEqual(true);
        });

        it('returns true if payment is acknowledged', () => {
            selectors = createInternalCheckoutSelectors({
                ...state,
                checkout: {
                    ...state.checkout,
                    data: getCheckoutWithPayments(),
                },
            });
            paymentSelector = createPaymentSelector(selectors.checkout, selectors.order);

            expect(paymentSelector.isPaymentDataSubmitted(getPaymentMethod())).toEqual(true);
        });

        it('returns true if payment is finalized', () => {
            const checkout = getCheckoutWithPayments();

            if (checkout.payments) {
                checkout.payments[0].detail.step = FINALIZE;
            }

            selectors = createInternalCheckoutSelectors({
                ...state,
                checkout: {
                    ...state.checkout,
                    data: checkout,
                },
            });
            paymentSelector = createPaymentSelector(selectors.checkout, selectors.order);

            expect(paymentSelector.isPaymentDataSubmitted(getPaymentMethod())).toEqual(true);
        });

        it('returns false if payment is not tokenized, acknowledged or finalized', () => {
            selectors = createInternalCheckoutSelectors({
                ...state,
                order: {
                    ...state.order,
                    data: undefined,
                    meta: undefined,
                },
            });
            paymentSelector = createPaymentSelector(selectors.checkout, selectors.order);

            expect(paymentSelector.isPaymentDataSubmitted(getPaymentMethod())).toEqual(false);
        });
    });
});
