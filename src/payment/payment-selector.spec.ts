import { merge } from 'lodash';

import { CheckoutSelector, CheckoutStoreState } from '../checkout';
import { getCheckoutPayment, getCheckoutStoreState, getCheckoutWithPayments } from '../checkout/checkouts.mock';
import { OrderSelector } from '../order';
import { getCompleteOrder as getInternalCompleteOrder } from '../order/internal-orders.mock';

import { getPaymentMethod } from './payment-methods.mock';
import PaymentSelector from './payment-selector';
import { ACKNOWLEDGE, FINALIZE } from './payment-status-types';

describe('PaymentSelector', () => {
    let state;
    let checkoutSelector: CheckoutSelector;
    let paymentSelector: PaymentSelector;
    let orderSelector: OrderSelector;

    beforeEach(() => {
        state = getCheckoutStoreState();
        checkoutSelector = new CheckoutSelector(state.checkout);
        orderSelector = new OrderSelector(state.order);
    });

    describe('#getPaymentId()', () => {
        it('returns payment ID from order if order has been created', () => {
            paymentSelector = new PaymentSelector(checkoutSelector, orderSelector);

            expect(paymentSelector.getPaymentId().providerId).toEqual('authorizenet');
        });

        it('returns payment ID from internal order if order has just been created before order is loaded', () => {
            orderSelector = new OrderSelector({
                ...state.order,
                data: undefined,
                meta: { payment: getInternalCompleteOrder().payment },
            });
            paymentSelector = new PaymentSelector(checkoutSelector, orderSelector);

            expect(paymentSelector.getPaymentId().providerId).toEqual('authorizenet');
        });

        it('returns payment ID from checkout if order has not been created', () => {
            orderSelector = new OrderSelector({ ...state.order, data: undefined });
            checkoutSelector = new CheckoutSelector({
                ...state.checkout,
                data: getCheckoutWithPayments(),
            });
            paymentSelector = new PaymentSelector(checkoutSelector, orderSelector);

            expect(paymentSelector.getPaymentId().providerId).toEqual('authorizenet');
        });
    });

    describe('#getPaymentStatus()', () => {
        it('returns payment status from order if order has been created', () => {
            paymentSelector = new PaymentSelector(checkoutSelector, orderSelector);

            expect(paymentSelector.getPaymentStatus()).toEqual(FINALIZE);
        });

        it('returns payment status from internal order if order has just been created before order is loaded', () => {
            orderSelector = new OrderSelector({
                ...state.order,
                data: undefined,
                meta: { payment: getInternalCompleteOrder().payment },
            });
            paymentSelector = new PaymentSelector(checkoutSelector, orderSelector);

            expect(paymentSelector.getPaymentStatus()).toEqual(FINALIZE);
        });

        it('returns payment status from checkout if order has not been created', () => {
            orderSelector = new OrderSelector({ ...state.order, data: undefined });
            checkoutSelector = new CheckoutSelector({
                ...state.checkout,
                data: getCheckoutWithPayments(),
            });
            paymentSelector = new PaymentSelector(checkoutSelector, orderSelector);

            expect(paymentSelector.getPaymentStatus()).toEqual(ACKNOWLEDGE);
        });
    });

    describe('#getPaymentRedirectUrl()', () => {
        it('returns redirect URL if available', () => {
            orderSelector = new OrderSelector({
                ...state.order,
                data: undefined,
                meta: {
                    payment: {
                        ...getInternalCompleteOrder().payment,
                        redirectUrl: '/checkout.php',
                    },
                },
            });
            paymentSelector = new PaymentSelector(checkoutSelector, orderSelector);

            expect(paymentSelector.getPaymentRedirectUrl()).toEqual('/checkout.php');
        });

        it('returns undefined if unavailable', () => {
            paymentSelector = new PaymentSelector(checkoutSelector, orderSelector);

            expect(paymentSelector.getPaymentRedirectUrl()).toEqual(undefined);
        });
    });

    describe('#getPaymentToken()', () => {
        it('returns payment token if available', () => {
            paymentSelector = new PaymentSelector(checkoutSelector, orderSelector);

            expect(paymentSelector.getPaymentToken()).toEqual(state.order.meta.token);
        });

        it('returns undefined if unavailable', () => {
            orderSelector = new OrderSelector({
                ...state.order,
                meta: undefined,
            });
            paymentSelector = new PaymentSelector(checkoutSelector, orderSelector);

            expect(paymentSelector.getPaymentToken()).toEqual(undefined);
        });
    });

    describe('#isPaymentDataRequired()', () => {
        it('returns true if payment is required', () => {
            paymentSelector = new PaymentSelector(checkoutSelector, orderSelector);

            expect(paymentSelector.isPaymentDataRequired()).toEqual(true);
        });

        it('returns false if store credit exceeds grand total', () => {
            checkoutSelector = new CheckoutSelector(merge({}, state.checkout, {
                data: {
                    customer: {
                        storeCredit: 100000000000,
                    },
                },
            }));
            paymentSelector = new PaymentSelector(checkoutSelector, orderSelector);

            expect(paymentSelector.isPaymentDataRequired(true)).toEqual(false);
        });

        it('returns true if store credit exceeds grand total but not using store credit', () => {
            checkoutSelector = new CheckoutSelector(merge({}, state.checkout, {
                data: {
                    customer: {
                        storeCredit: 100000000000,
                    },
                },
            }));
            paymentSelector = new PaymentSelector(checkoutSelector, orderSelector);

            expect(paymentSelector.isPaymentDataRequired(false)).toEqual(true);
        });
    });

    describe('#isPaymentDataSubmitted()', () => {
        it('returns true if payment is tokenized', () => {
            const paymentMethod = {
                ...getPaymentMethod(),
                nonce: '8903d867-6f7b-475c-8ab2-0b47ec6e000d',
            };
            paymentSelector = new PaymentSelector(checkoutSelector, orderSelector);

            expect(paymentSelector.isPaymentDataSubmitted(paymentMethod)).toEqual(true);
        });

        it('returns true if payment is acknowledged', () => {
            checkoutSelector = new CheckoutSelector({
                ...state.checkout,
                data: getCheckoutWithPayments(),
            });
            paymentSelector = new PaymentSelector(checkoutSelector, orderSelector);

            expect(paymentSelector.isPaymentDataSubmitted(getPaymentMethod())).toEqual(true);
        });

        it('returns true if payment is finalized', () => {
            const checkout = getCheckoutWithPayments();

            checkout.payments[0].detail.step = FINALIZE;

            checkoutSelector = new CheckoutSelector({ ...state.checkout, data: checkout });
            paymentSelector = new PaymentSelector(checkoutSelector, orderSelector);

            expect(paymentSelector.isPaymentDataSubmitted(getPaymentMethod())).toEqual(true);
        });

        it('returns false if payment is not tokenized, acknowledged or finalized', () => {
            orderSelector = new OrderSelector({ ...state.order, data: undefined });
            paymentSelector = new PaymentSelector(checkoutSelector, orderSelector);

            expect(paymentSelector.isPaymentDataSubmitted(getPaymentMethod())).toEqual(false);
        });
    });
});
