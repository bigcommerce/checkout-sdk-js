import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { omit } from 'lodash';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutStoreState, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState, getCheckoutWithPayments } from '../../../checkout/checkouts.mock';
import { OrderActionCreator, OrderActionType, OrderRequestSender, SubmitOrderAction } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { createSpamProtection, SpamProtectionActionCreator } from '../../../order/spam-protection';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';

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
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(createRequestSender()),
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender())),
            new SpamProtectionActionCreator(createSpamProtection(createScriptLoader()))
        );

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer()
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

    it('throws error to inform that order finalization is not required', async () => {
        try {
            await strategy.finalize();
        } catch (error) {
            expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
        }
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
