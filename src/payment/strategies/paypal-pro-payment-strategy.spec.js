import { createAction } from '@bigcommerce/data-store';
import { omit } from 'lodash';
import { Observable } from 'rxjs';
import { createCheckoutStore } from '../../checkout';
import { OrderActionType } from '../../order';
import { getOrderRequestBody, getIncompleteOrderState } from '../../order/internal-orders.mock';
import { SUBMIT_PAYMENT_REQUESTED } from '../payment-action-types';
import PaypalProPaymentStrategy from './paypal-pro-payment-strategy';
import { getCheckoutStoreState, getCheckoutWithPayments } from '../../checkout/checkouts.mock';

describe('PaypalProPaymentStrategy', () => {
    let orderActionCreator;
    let paymentActionCreator;
    let store;
    let strategy;
    let submitOrderAction;
    let submitPaymentAction;

    beforeEach(() => {
        submitOrderAction = Observable.of(createAction(OrderActionType.SubmitOrderRequested));
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

        expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(payload, 'payment'), undefined);
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

    describe('if payment is acknowledged', () => {
        beforeEach(() => {
            store = createCheckoutStore({
                ...getCheckoutStoreState(),
                checkout: {
                    data: getCheckoutWithPayments(),
                },
            });

            strategy = new PaypalProPaymentStrategy(store, orderActionCreator);

            jest.spyOn(store, 'dispatch');
        });

        it('submits order with payment method name', async () => {
            const payload = getOrderRequestBody();

            await strategy.execute(payload);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith({
                ...payload,
                payment: { methodId: payload.payment.methodId },
            }, undefined);
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
