import { merge } from 'lodash';
import { getCartState } from '../cart/internal-carts.mock';
import { getCustomerState } from '../customer/internal-customers.mock';
import { getSubmittedOrder, getSubmittedOrderState } from './internal-orders.mock';
import { getPaymentMethod } from '../payment/payment-methods.mock';
import { getPaymentState } from '../payment/payments.mock';
import { getErrorResponse } from '../common/http-request/responses.mock';
import * as paymentStatusTypes from '../payment/payment-status-types';
import OrderSelector from './order-selector';

describe('OrderSelector', () => {
    let order;
    let orderSelector;
    let state;

    beforeEach(() => {
        order = getSubmittedOrder();
        state = {
            cart: getCartState(),
            customer: getCustomerState(),
            order: getSubmittedOrderState(),
            payment: getPaymentState(),
        };
    });

    describe('#getOrder()', () => {
        it('returns the current order', () => {
            orderSelector = new OrderSelector(state.order, state.customer, state.cart);

            expect(orderSelector.getOrder()).toEqual(order);
        });
    });

    describe('#getOrderMeta()', () => {
        it('returns order meta', () => {
            orderSelector = new OrderSelector(state.order, state.customer, state.cart);

            expect(orderSelector.getOrderMeta()).toEqual({
                deviceFingerprint: 'a084205e-1b1f-487d-9087-e072d20747e5',
            });
        });
    });

    describe('#getLoadError()', () => {
        it('returns error if unable to load', () => {
            const loadError = getErrorResponse();

            orderSelector = new OrderSelector({
                ...state.order,
                errors: { loadError },
            }, state.payment, state.customer, state.cart);

            expect(orderSelector.getLoadError()).toEqual(loadError);
        });

        it('does not returns error if able to load', () => {
            orderSelector = new OrderSelector(state.order, state.customer, state.cart);

            expect(orderSelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading order', () => {
            orderSelector = new OrderSelector({
                ...state.order,
                statuses: { isLoading: true },
            }, state.payment, state.customer, state.cart);

            expect(orderSelector.isLoading()).toEqual(true);
        });

        it('returns false if not loading order', () => {
            orderSelector = new OrderSelector(state.order, state.customer, state.cart);

            expect(orderSelector.isLoading()).toEqual(false);
        });
    });

    describe('#isPaymentDataRequired()', () => {
        it('returns true if payment is required', () => {
            orderSelector = new OrderSelector(state.order, state.customer, state.cart);

            expect(orderSelector.isPaymentDataRequired()).toEqual(true);
        });

        it('returns false if store credit exceeds grand total', () => {
            orderSelector = new OrderSelector(state.order, merge({}, state.customer, {
                data: { storeCredit: 100000000000 },
            }), state.cart);

            expect(orderSelector.isPaymentDataRequired(true)).toEqual(false);
        });

        it('returns true if store credit exceeds grand total but not using store credit', () => {
            orderSelector = new OrderSelector(state.order, merge({}, state.customer, {
                data: { storeCredit: 100000000000 },
            }), state.cart);

            expect(orderSelector.isPaymentDataRequired(false)).toEqual(true);
        });
    });

    describe('#isPaymentDataSubmitted()', () => {
        it('returns true if payment is tokenized', () => {
            const paymentMethod = { ...getPaymentMethod(), nonce: '8903d867-6f7b-475c-8ab2-0b47ec6e000d' };

            orderSelector = new OrderSelector(state.order, state.customer, state.cart);

            expect(orderSelector.isPaymentDataSubmitted(paymentMethod)).toEqual(true);
        });

        it('returns true if payment is acknowledged', () => {
            orderSelector = new OrderSelector(merge({}, state.order, {
                data: { payment: { status: paymentStatusTypes.ACKNOWLEDGE } },
            }), state.payment, state.customer, state.cart);

            expect(orderSelector.isPaymentDataSubmitted(getPaymentMethod())).toEqual(true);
        });

        it('returns true if payment is finalized', () => {
            orderSelector = new OrderSelector(merge({}, state.order, {
                data: { payment: { status: paymentStatusTypes.FINALIZE } },
            }), state.payment, state.customer, state.cart);

            expect(orderSelector.isPaymentDataSubmitted(getPaymentMethod())).toEqual(true);
        });

        it('returns false if payment is not tokenized, acknowledged or finalized', () => {
            orderSelector = new OrderSelector(state.order, state.customer, state.cart);

            expect(orderSelector.isPaymentDataSubmitted(getPaymentMethod())).toEqual(false);
        });
    });
});
