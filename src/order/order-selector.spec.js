import { getCartState } from '../cart/internal-carts.mock';
import { getCustomerState } from '../customer/internal-customers.mock';
import { getSubmittedOrder, getSubmittedOrderState } from './internal-orders.mock';
import { getPaymentState } from '../payment/payments.mock';
import { getErrorResponse } from '../common/http-request/responses.mock';
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

            expect(orderSelector.getOrderMeta()).toEqual(getSubmittedOrderState().meta);
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
});
