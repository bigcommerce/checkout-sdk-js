import { omit } from 'lodash';
import { createCheckoutStore } from '../../checkout';
import { getOrderRequestBody, getIncompleteOrder } from '../../order/orders.mock';
import * as paymentStatusTypes from '../payment-status-types';
import PaypalProPaymentStrategy from './paypal-pro-payment-strategy';

describe('PaypalProPaymentStrategy', () => {
    let placeOrderService;
    let store;
    let strategy;

    beforeEach(() => {
        placeOrderService = {
            submitOrder: jest.fn(() => Promise.resolve(store.getState())),
            submitPayment: jest.fn(() => Promise.resolve(store.getState())),
        };

        store = createCheckoutStore();

        strategy = new PaypalProPaymentStrategy(store, placeOrderService);

        jest.spyOn(store.getState().checkout, 'getOrder').mockReturnValue(getIncompleteOrder());
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

    describe('if payment is acknowledged', () => {
        beforeEach(() => {
            const { checkout } = store.getState();

            jest.spyOn(checkout, 'getOrder').mockReturnValue({
                ...getIncompleteOrder(),
                payment: { status: paymentStatusTypes.ACKNOWLEDGE },
            });
        });

        it('submits order with payment method name', async () => {
            const payload = getOrderRequestBody();

            await strategy.execute(payload);

            expect(placeOrderService.submitOrder).toHaveBeenCalledWith({
                ...payload,
                payment: { name: payload.payment.name },
            }, undefined);
        });

        it('does not submit payment separately', async () => {
            const payload = getOrderRequestBody();

            await strategy.execute(payload);

            expect(placeOrderService.submitPayment).not.toHaveBeenCalled();
        });
    });
});
