import { createInternalCheckoutSelectors, CheckoutStoreState, InternalCheckoutSelectors } from '../checkout';
import { getCheckoutStoreStateWithOrder } from '../checkout/checkouts.mock';
import { RequestError } from '../common/error/errors';
import { getErrorResponse } from '../common/http-request/responses.mock';

import OrderSelector, { createOrderSelectorFactory, OrderSelectorFactory } from './order-selector';
import { getOrder } from './orders.mock';

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
            orderSelector = createOrderSelector(state.order, selectors.billingAddress, selectors.coupons);

            expect(orderSelector.getOrder()).toEqual({
                ...getOrder(),
                billingAddress: selectors.billingAddress.getBillingAddress(),
                coupons: selectors.coupons.getCoupons(),
            });
        });
    });

    describe('#getOrderMeta()', () => {
        it('returns order meta', () => {
            orderSelector = createOrderSelector(state.order, selectors.billingAddress, selectors.coupons);

            expect(orderSelector.getOrderMeta()).toEqual(state.order.meta);
        });
    });

    describe('#getLoadError()', () => {
        it('returns error if unable to load', () => {
            const loadError = new RequestError(getErrorResponse());

            orderSelector = createOrderSelector({
                ...state.order,
                errors: { loadError },
            }, selectors.billingAddress, selectors.coupons);

            expect(orderSelector.getLoadError()).toEqual(loadError);
        });

        it('does not returns error if able to load', () => {
            orderSelector = createOrderSelector(state.order, selectors.billingAddress, selectors.coupons);

            expect(orderSelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading order', () => {
            orderSelector = createOrderSelector({
                ...state.order,
                statuses: { isLoading: true },
            }, selectors.billingAddress, selectors.coupons);

            expect(orderSelector.isLoading()).toEqual(true);
        });

        it('returns false if not loading order', () => {
            orderSelector = createOrderSelector(state.order, selectors.billingAddress, selectors.coupons);

            expect(orderSelector.isLoading()).toEqual(false);
        });
    });
});
