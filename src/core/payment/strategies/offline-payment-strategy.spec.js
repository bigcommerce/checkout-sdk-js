import { createCheckoutStore } from '../../checkout';
import { getOrderRequestBody } from '../../order/orders.mock';
import OfflinePaymentStrategy from './offline-payment-strategy';

describe('OfflinePaymentStrategy', () => {
    let placeOrderService;
    let store;
    let strategy;

    beforeEach(() => {
        store = createCheckoutStore();
        placeOrderService = {
            submitOrder: jest.fn(() => Promise.resolve(store.getState())),
            initializeOffsitePayment: jest.fn(() => Promise.resolve(store.getState())),
        };
        strategy = new OfflinePaymentStrategy(store, placeOrderService);
    });

    it('submits order without payment data', async () => {
        await strategy.execute(getOrderRequestBody());

        expect(placeOrderService.submitOrder).toHaveBeenCalledWith({
            ...getOrderRequestBody(),
            payment: {
                name: 'authorizenet',
            },
        }, undefined);
    });

    it('returns checkout state', async () => {
        const output = await strategy.execute(getOrderRequestBody());

        expect(output).toEqual(store.getState());
    });
});
