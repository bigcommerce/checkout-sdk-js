import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, Action } from '@bigcommerce/data-store';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { Observable } from 'rxjs';

import { createCheckoutClient, createCheckoutStore, CheckoutStore } from '../../checkout';
import CheckoutClient from '../../checkout/checkout-client';
import { OrderActionCreator, OrderActionType, OrderRequestBody } from '../../order';
import { getOrderRequestBody } from '../../order/internal-orders.mock';
import { getWepay } from '../../payment/payment-methods.mock';
import { WepayRiskClient } from '../../remote-checkout/methods/wepay';
import { CreditCard } from '../payment';
import PaymentActionCreator from '../payment-action-creator';
import { SUBMIT_PAYMENT_REQUESTED } from '../payment-action-types';
import PaymentMethod from '../payment-method';
import PaymentRequestSender from '../payment-request-sender';

import WepayPaymentStrategy from './wepay-payment-strategy';

describe('WepayPaymentStrategy', () => {
    const testRiskToken = 'test-risk-token';
    let scriptLoader;
    let wepayRiskClient: WepayRiskClient;
    let client: CheckoutClient;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let payload: OrderRequestBody;
    let paymentMethod: PaymentMethod;
    let store: CheckoutStore;
    let strategy: WepayPaymentStrategy;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;

    beforeEach(() => {
        client = createCheckoutClient();
        store = createCheckoutStore();
        scriptLoader = createScriptLoader();
        wepayRiskClient = new WepayRiskClient(scriptLoader);
        orderActionCreator = new OrderActionCreator(client);

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator
        );

        strategy = new WepayPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            wepayRiskClient
        );

        paymentMethod = getWepay();

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                name: paymentMethod.id,
                gateway: paymentMethod.gateway,
            },
        });

        submitOrderAction = Observable.of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = Observable.of(createAction(SUBMIT_PAYMENT_REQUESTED));

        jest.spyOn(wepayRiskClient, 'initialize')
            .mockReturnValue(Promise.resolve(wepayRiskClient));

        jest.spyOn(wepayRiskClient, 'getRiskToken')
            .mockReturnValue(testRiskToken);

        jest.spyOn(scriptLoader, 'loadScript')
            .mockReturnValue(Promise.resolve(null));

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        jest.spyOn(store, 'dispatch');
    });

    describe('#initialize', () => {
        it('should initialize the WePay risk client', () => {
            jest.spyOn(wepayRiskClient, 'initialize');

            strategy.initialize({ methodId: paymentMethod.id });

            expect(wepayRiskClient.initialize).toHaveBeenCalled();
        });
    });

    describe('#execute', () => {
        it('should submit the payment with the risk token', async () => {
            await strategy.initialize({ methodId: paymentMethod.id });
            await strategy.execute(payload);

            const paymentWithToken = { ...payload.payment };
            (paymentWithToken.paymentData as CreditCard)
                .extraData = { riskToken: testRiskToken };

            expect(paymentActionCreator.submitPayment)
                .toHaveBeenCalledWith(paymentWithToken);

            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
            expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
        });
    });
});
