
import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { omit } from 'lodash';
import { Observable } from 'rxjs';

import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutStoreState, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState, getCheckoutWithPayments } from '../../../checkout/checkouts.mock';
import { OrderActionCreator, OrderActionType, OrderRequestSender, SubmitOrderAction } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import PaymentRequestSender from '../../payment-request-sender';

import PaypalProPaymentStrategy from './paypal-pro-payment-strategy';

describe('PaypalProPaymentStrategy', () => {
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let state: CheckoutStoreState;
    let store: CheckoutStore;
    let strategy: PaypalProPaymentStrategy;
    let submitOrderAction: Observable<SubmitOrderAction>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;

    beforeEach(() => {
        submitOrderAction = Observable.of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = Observable.of(createAction(PaymentActionType.SubmitPaymentRequested));

        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(createRequestSender()),
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender()))
        );

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator
        );

        state = getCheckoutStoreState();
        store = createCheckoutStore(state);

        strategy = new PaypalProPaymentStrategy(store, orderActionCreator, paymentActionCreator);

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);
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
                    ...state.checkout,
                    data: getCheckoutWithPayments(),
                },
            });

            strategy = new PaypalProPaymentStrategy(store, orderActionCreator, paymentActionCreator);

            jest.spyOn(store, 'dispatch');
        });

        it('submits order with payment method name', async () => {
            const payload = getOrderRequestBody();

            await strategy.execute(payload);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith({
                ...payload,
                payment: { methodId: payload.payment && payload.payment.methodId },
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
