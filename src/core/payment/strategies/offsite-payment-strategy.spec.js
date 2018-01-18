import { getOrderRequestBody, getIncompleteOrder, getSubmittedOrder } from '../../order/orders.mock';
import { getPaymentMethod } from '../payment-methods.mock';
import { merge, omit } from 'lodash';
import * as paymentStatusTypes from '../payment-status-types';
import createCheckoutStore from '../../create-checkout-store';
import OffsitePaymentStrategy from './offsite-payment-strategy';

describe('OffsitePaymentStrategy', () => {
    let placeOrderService;
    let store;
    let strategy;

    beforeEach(() => {
        store = createCheckoutStore();
        placeOrderService = {
            submitOrder: jest.fn(() => Promise.resolve(store.getState())),
            finalizeOrder: jest.fn(() => Promise.resolve(store.getState())),
            initializeOffsitePayment: jest.fn(() => Promise.resolve(store.getState())),
        };

        strategy = new OffsitePaymentStrategy(getPaymentMethod(), store, placeOrderService);
    });

    it('submits order without payment data', async () => {
        const payload = getOrderRequestBody();
        const options = {};

        await strategy.execute(payload, options);

        expect(placeOrderService.submitOrder).toHaveBeenCalledWith(omit(payload, 'payment'), options);
    });

    it('submits order with payment data if payment gateway is "adyen"', async () => {
        const payload = merge({}, getOrderRequestBody(), {
            payment: { name: 'amex', gateway: 'adyen' },
        });
        const options = {};

        await strategy.execute(payload, options);

        expect(placeOrderService.submitOrder).toHaveBeenCalledWith(payload, options);
    });

    it('initializes offsite payment flow', async () => {
        const payload = getOrderRequestBody();
        const options = {};

        await strategy.execute(payload, options);

        expect(placeOrderService.initializeOffsitePayment).toHaveBeenCalledWith(payload.payment, payload.useStoreCredit, options);
    });

    it('finalizes order if order is created and payment is acknowledged', async () => {
        const { checkout } = store.getState();
        const options = {};

        jest.spyOn(checkout, 'getOrder').mockReturnValue(merge({}, getSubmittedOrder(), {
            payment: {
                status: paymentStatusTypes.ACKNOWLEDGE,
            },
        }));

        await strategy.finalize(options);

        expect(placeOrderService.finalizeOrder).toHaveBeenCalledWith(checkout.getOrder().orderId, options);
    });

    it('finalizes order if order is created and payment is finalized', async () => {
        const { checkout } = store.getState();
        const options = {};

        jest.spyOn(checkout, 'getOrder').mockReturnValue(merge({}, getSubmittedOrder(), {
            payment: {
                status: paymentStatusTypes.FINALIZE,
            },
        }));

        await strategy.finalize(options);

        expect(placeOrderService.finalizeOrder).toHaveBeenCalledWith(checkout.getOrder().orderId, options);
    });

    it('does not finalize order if order is not created', async () => {
        const { checkout } = store.getState();

        jest.spyOn(checkout, 'getOrder').mockReturnValue(getIncompleteOrder());

        await strategy.finalize();

        expect(placeOrderService.finalizeOrder).not.toHaveBeenCalled();
    });

    it('does not finalize order if order is not finalized or acknowledged', async () => {
        const { checkout } = store.getState();

        jest.spyOn(checkout, 'getOrder').mockReturnValue(merge({}, getSubmittedOrder(), {
            payment: {
                status: paymentStatusTypes.INITIALIZE,
            },
        }));

        await strategy.finalize();

        expect(placeOrderService.finalizeOrder).not.toHaveBeenCalled();
    });

    it('returns checkout state', async () => {
        const output = await strategy.execute(getOrderRequestBody());

        expect(output).toEqual(store.getState());
    });
});
