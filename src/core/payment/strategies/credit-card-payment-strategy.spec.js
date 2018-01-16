import { omit } from 'lodash';
import { getOrderRequestBody } from '../../order/orders.mock';
import { getPaymentMethod } from '../payment-methods.mock';
import createCheckoutStore from '../../create-checkout-store';
import CreditCardPaymentStrategy from './credit-card-payment-strategy';

describe('CreditCardPaymentStrategy', () => {
    let placeOrderService;
    let store;
    let strategy;

    beforeEach(() => {
        placeOrderService = {
            submitOrder: jest.fn(() => Promise.resolve(store.getState())),
            submitPayment: jest.fn(() => Promise.resolve(store.getState())),
        };

        store = createCheckoutStore();

        strategy = new CreditCardPaymentStrategy(getPaymentMethod(), store, placeOrderService);
    });

    it('submits order without payment data', async () => {
        const payload = getOrderRequestBody();

        await strategy.execute(payload);

        expect(placeOrderService.submitOrder).toHaveBeenCalledWith(omit(payload, 'payment'), undefined);
    });

    it('submits payment separately', async () => {
        const payload = getOrderRequestBody();

        await strategy.execute(payload);

        expect(placeOrderService.submitPayment).toHaveBeenCalledWith(payload.payment, payload.useStoreCredit, undefined);
    });

    it('returns checkout state', async () => {
        const output = await strategy.execute(getOrderRequestBody());

        expect(output).toEqual(store.getState());
    });
});
