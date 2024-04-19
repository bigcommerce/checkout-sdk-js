import { set } from 'lodash';

import {
    CheckoutStoreState,
    createInternalCheckoutSelectors,
    InternalCheckoutSelectors,
} from '../checkout';
import { getCheckoutStoreStateWithOrder } from '../checkout/checkouts.mock';
import { RequestError } from '../common/error/errors';
import { getErrorResponse } from '../common/http-request/responses.mock';

import OrderSelector, { createOrderSelectorFactory, OrderSelectorFactory } from './order-selector';
import { getOrder, getOrderState } from './orders.mock';

import { GatewayOrderPayment } from '.';

describe('OrderSelector', () => {
    let createOrderSelector: OrderSelectorFactory;
    let orderSelector: OrderSelector;
    let state: CheckoutStoreState;
    let selectors: InternalCheckoutSelectors;

    beforeEach(() => {
        createOrderSelector = createOrderSelectorFactory();
        state = getCheckoutStoreStateWithOrder();
        selectors = createInternalCheckoutSelectors(state);
    });

    describe('#getOrder()', () => {
        it('returns the current order', () => {
            orderSelector = createOrderSelector(
                state.order,
                selectors.orderBillingAddress,
                selectors.coupons,
            );

            expect(orderSelector.getOrder()).toEqual({
                ...getOrder(),
                billingAddress: selectors.orderBillingAddress.getOrderBillingAddress(),
                coupons: selectors.coupons.getCoupons(),
            });
        });
    });

    describe('#getOrderMeta()', () => {
        it('returns order meta', () => {
            orderSelector = createOrderSelector(
                state.order,
                selectors.orderBillingAddress,
                selectors.coupons,
            );

            expect(orderSelector.getOrderMeta()).toEqual(state.order.meta);
        });
    });

    describe('#getLoadError()', () => {
        it('returns error if unable to load', () => {
            const loadError = new RequestError(getErrorResponse());

            orderSelector = createOrderSelector(
                {
                    ...state.order,
                    errors: { loadError },
                },
                selectors.orderBillingAddress,
                selectors.coupons,
            );

            expect(orderSelector.getLoadError()).toEqual(loadError);
        });

        it('does not returns error if able to load', () => {
            orderSelector = createOrderSelector(
                state.order,
                selectors.orderBillingAddress,
                selectors.coupons,
            );

            expect(orderSelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#getPaymentId()', () => {
        describe('when there is a matching payment method', () => {
            it('returns the paymentId', () => {
                const orderPayment: GatewayOrderPayment = {
                    providerId: 'some-provider-id',
                    description: '',
                    amount: 225,
                    detail: { step: 'INITIALIZE', instructions: '' },
                    paymentId: 'abc',
                };

                const orderState = set(getOrderState(), 'data.payments', [orderPayment]);

                orderSelector = createOrderSelector(
                    orderState,
                    selectors.orderBillingAddress,
                    selectors.coupons,
                );

                expect(orderSelector.getPaymentId('some-provider-id')).toBe('abc');
            });
        });

        describe('when there is no matching payment method', () => {
            it('returns undefined', () => {
                orderSelector = createOrderSelector(
                    state.order,
                    selectors.orderBillingAddress,
                    selectors.coupons,
                );

                expect(orderSelector.getPaymentId('some-non-matching-id')).toBeUndefined();
            });
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading order', () => {
            orderSelector = createOrderSelector(
                {
                    ...state.order,
                    statuses: { isLoading: true },
                },
                selectors.orderBillingAddress,
                selectors.coupons,
            );

            expect(orderSelector.isLoading()).toBe(true);
        });

        it('returns false if not loading order', () => {
            orderSelector = createOrderSelector(
                state.order,
                selectors.orderBillingAddress,
                selectors.coupons,
            );

            expect(orderSelector.isLoading()).toBe(false);
        });
    });
});
