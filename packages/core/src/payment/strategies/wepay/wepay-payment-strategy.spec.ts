import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { HostedFormFactory } from '../../../hosted-form';
import { OrderActionCreator, OrderActionType, OrderRequestBody, OrderRequestSender } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import { getWepay } from '../../payment-methods.mock';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';

import WepayPaymentStrategy from './wepay-payment-strategy';
import WepayRiskClient from './wepay-risk-client';

describe('WepayPaymentStrategy', () => {
    const testRiskToken = 'test-risk-token';

    let scriptLoader: ScriptLoader;
    let wepayRiskClient: WepayRiskClient;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let orderRequestSender: OrderRequestSender;
    let payload: OrderRequestBody;
    let paymentMethod: PaymentMethod;
    let store: CheckoutStore;
    let strategy: WepayPaymentStrategy;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;

    beforeEach(() => {
        store = createCheckoutStore();
        scriptLoader = createScriptLoader();
        wepayRiskClient = new WepayRiskClient(scriptLoader);
        orderRequestSender = new OrderRequestSender(createRequestSender());
        orderActionCreator = new OrderActionCreator(
            orderRequestSender,
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender()))
        );

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader()))
        );

        strategy = new WepayPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            new HostedFormFactory(store),
            wepayRiskClient
        );

        paymentMethod = getWepay();

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            },
        });

        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

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

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
            .mockReturnValue(paymentMethod);

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

            const paymentWithToken = {
                ...payload.payment,
                paymentData: {
                    ...(payload.payment && payload.payment.paymentData),
                    deviceSessionId: testRiskToken,
                },
            };

            expect(paymentActionCreator.submitPayment)
                .toHaveBeenCalledWith(paymentWithToken);

            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
            expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
        });
    });
});
