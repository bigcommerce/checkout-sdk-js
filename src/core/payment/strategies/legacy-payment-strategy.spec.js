import { getOrderRequestBody } from '../../order/orders.mock';
import createCheckoutStore from '../../create-checkout-store';
import LegacyPaymentStrategy from './legacy-payment-strategy';

describe('LegacyPaymentStrategy', () => {
    let placeOrderService;
    let store;
    let strategy;

    beforeEach(() => {
        store = createCheckoutStore();
        placeOrderService = {
            submitOrder: jest.fn(() => Promise.resolve(store.getState())),
            submitPayment: jest.fn(() => Promise.resolve(store.getState())),
        };

        strategy = new LegacyPaymentStrategy(store, placeOrderService);
    });

    it('submits order with payment data', async () => {
        await strategy.execute(getOrderRequestBody());

        expect(placeOrderService.submitOrder).toHaveBeenCalledWith(getOrderRequestBody(), undefined);
    });

    it('does not submit payment data separately', async () => {
        await strategy.execute(getOrderRequestBody());

        expect(placeOrderService.submitPayment).not.toHaveBeenCalled();
    });

    it('returns checkout state', async () => {
        const output = await strategy.execute(getOrderRequestBody());

        expect(output).toEqual(store.getState());
    });
});
