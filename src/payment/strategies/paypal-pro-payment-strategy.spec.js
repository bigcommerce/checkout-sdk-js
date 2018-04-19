import { createAction } from '@bigcommerce/data-store';
import { merge, omit } from 'lodash';
import { Observable } from 'rxjs';
import { createCheckoutStore } from '../../checkout';
import { MissingDataError } from '../../common/error/errors';
import { getOrderRequestBody, getIncompleteOrderState } from '../../order/internal-orders.mock';
import { SUBMIT_ORDER_REQUESTED } from '../../order/order-action-types';
import { SUBMIT_PAYMENT_REQUESTED } from '../payment-action-types';
import * as paymentStatusTypes from '../payment-status-types';
import PaypalProPaymentStrategy from './paypal-pro-payment-strategy';

describe('PaypalProPaymentStrategy', () => {
    let orderActionCreator;
    let paymentActionCreator;
    let store;
    let strategy;
    let submitOrderAction;
    let submitPaymentAction;

    beforeEach(() => {
        submitOrderAction = Observable.of(createAction(SUBMIT_ORDER_REQUESTED));
        submitPaymentAction = Observable.of(createAction(SUBMIT_PAYMENT_REQUESTED));

        orderActionCreator = {
            submitOrder: jest.fn(() => submitOrderAction),
        };

        paymentActionCreator = {
            submitPayment: jest.fn(() => submitPaymentAction),
        };

        store = createCheckoutStore({
            order: getIncompleteOrderState(),
        });

        strategy = new PaypalProPaymentStrategy(store, orderActionCreator, paymentActionCreator);

        jest.spyOn(store, 'dispatch');
    });

    it('submits order without payment data', async () => {
        const payload = getOrderRequestBody();

        await strategy.execute(payload);

        expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(payload, 'payment'), true, undefined);
        expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
    });

    it('submits payment separately', async () => {
        const payload = getOrderRequestBody();

        await strategy.execute(payload);

        expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(payload.payment);
        expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
    });

    it('returns checkout state', async () => {
        const output = await strategy.execute(getOrderRequestBody());

        expect(output).toEqual(store.getState());
    });

    it('throws error if order is missing', async () => {
        store = createCheckoutStore();
        strategy = new PaypalProPaymentStrategy(store, orderActionCreator);

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

            strategy = new PaypalProPaymentStrategy(store, orderActionCreator);

            jest.spyOn(store, 'dispatch');
        });

        it('submits order with payment method name', async () => {
            const payload = getOrderRequestBody();

            await strategy.execute(payload);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith({
                ...payload,
                payment: { name: payload.payment.name },
            }, true, undefined);
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('does not submit payment separately', async () => {
            const payload = getOrderRequestBody();

            await strategy.execute(payload);

            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
            expect(store.dispatch).not.toHaveBeenCalledWith(submitPaymentAction);
        });
    });
});
