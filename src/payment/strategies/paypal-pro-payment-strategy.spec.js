import { merge, omit } from 'lodash';
import { createCheckoutStore } from '../../checkout';
import { MissingDataError } from '../../common/error/errors';
import { getOrderRequestBody, getIncompleteOrderState } from '../../order/internal-orders.mock';
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

        store = createCheckoutStore({
            order: getIncompleteOrderState(),
        });

        strategy = new PaypalProPaymentStrategy(store, placeOrderService);
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

    it('throws error if order is missing', async () => {
        store = createCheckoutStore();
        strategy = new PaypalProPaymentStrategy(store, placeOrderService);

        try {
            await strategy.execute(getOrderRequestBody());
        } catch (error) {
            expect(error).toBeInstanceOf(MissingDataError);
        }
    });

    describe('if payment is acknowledged', () => {
        beforeEach(() => {
            store = createCheckoutStore({
                order: merge({}, getIncompleteOrderState(), {
                    data: {
                        payment: { status: paymentStatusTypes.ACKNOWLEDGE },
                    },
                }),
            });

            strategy = new PaypalProPaymentStrategy(store, placeOrderService);
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
