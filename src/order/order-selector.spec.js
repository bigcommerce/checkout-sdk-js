import { getCheckoutStoreStateWithOrder } from '../checkout/checkouts.mock';
import { getErrorResponse } from '../common/http-request/responses.mock';

import OrderSelector from './order-selector';

describe('OrderSelector', () => {
    let orderSelector;
    let state;

    beforeEach(() => {
        state = getCheckoutStoreStateWithOrder();
    });

    describe('#getOrder()', () => {
        it('returns the current order', () => {
            orderSelector = new OrderSelector(state.order);

            expect(orderSelector.getOrder()).toEqual(state.order.data);
        });
    });

    describe('#getOrderMeta()', () => {
        it('returns order meta', () => {
            orderSelector = new OrderSelector(state.order);

            expect(orderSelector.getOrderMeta()).toEqual(state.order.meta);
        });
    });

    describe('#getLoadError()', () => {
        it('returns error if unable to load', () => {
            const loadError = getErrorResponse();

            orderSelector = new OrderSelector({
                ...state.order,
                errors: { loadError },
            });

            expect(orderSelector.getLoadError()).toEqual(loadError);
        });

        it('does not returns error if able to load', () => {
            orderSelector = new OrderSelector(state.order);

            expect(orderSelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading order', () => {
            orderSelector = new OrderSelector({
                ...state.order,
                statuses: { isLoading: true },
            });

            expect(orderSelector.isLoading()).toEqual(true);
        });

        it('returns false if not loading order', () => {
            orderSelector = new OrderSelector(state.order);

            expect(orderSelector.isLoading()).toEqual(false);
        });
    });
});
