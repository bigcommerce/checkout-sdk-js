import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, Action } from '@bigcommerce/data-store';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { Observable } from 'rxjs';

import { createCheckoutClient, createCheckoutStore, CheckoutStore } from '../../checkout';
import CheckoutClient from '../../checkout/checkout-client';
import { createPlaceOrderService, OrderActionCreator, OrderRequestBody, PlaceOrderService } from '../../order';
import { getOrderRequestBody } from '../../order/internal-orders.mock';
import { SUBMIT_ORDER_REQUESTED } from '../../order/order-action-types';
import { getWepay } from '../../payment/payment-methods.mock';
import { WepayRiskClient } from '../../remote-checkout/methods/wepay';
import { CreditCard } from '../payment';
import PaymentMethod from '../payment-method';

import WepayPaymentStrategy from './wepay-payment-strategy';

describe('WepayPaymentStrategy', () => {
    const testRiskToken = 'test-risk-token';
    let scriptLoader;

    let wepayRiskClient: WepayRiskClient;
    let client: CheckoutClient;
    let orderActionCreator: OrderActionCreator;
    let payload: OrderRequestBody;
    let paymentMethod: PaymentMethod;
    let placeOrderService: PlaceOrderService;
    let store: CheckoutStore;
    let strategy: WepayPaymentStrategy;
    let submitOrderAction: Observable<Action>;

    beforeEach(() => {
        scriptLoader = createScriptLoader();
        wepayRiskClient = new WepayRiskClient(scriptLoader);

        jest.spyOn(wepayRiskClient, 'initialize')
            .mockReturnValue(Promise.resolve(wepayRiskClient));

        jest.spyOn(wepayRiskClient, 'getRiskToken')
            .mockReturnValue(testRiskToken);

        client = createCheckoutClient();
        store = createCheckoutStore();

        jest.spyOn(scriptLoader, 'loadScript')
            .mockReturnValue(Promise.resolve(null));

        placeOrderService = createPlaceOrderService(
            store,
            client,
            createPaymentClient()
        );

        orderActionCreator = new OrderActionCreator(client);

        strategy = new WepayPaymentStrategy(
            store,
            placeOrderService,
            orderActionCreator,
            wepayRiskClient
        );

        paymentMethod = getWepay();

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                name: paymentMethod.id,
                gateway: paymentMethod.gateway,
            },
        });

        submitOrderAction = Observable.of(createAction(SUBMIT_ORDER_REQUESTED));

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(placeOrderService, 'submitPayment')
            .mockImplementation(() => Promise.resolve());
    });

    describe('#initialize', () => {
        it('should initialize the WePay risk client', () => {
            jest.spyOn(wepayRiskClient, 'initialize');

            strategy.initialize({ paymentMethod });

            expect(wepayRiskClient.initialize).toHaveBeenCalled();
        });
    });

    describe('#execute', () => {
        it('should submit the payment with the risk token', async () => {
            jest.spyOn(placeOrderService, 'submitPayment');
            await strategy.initialize({ paymentMethod });
            await strategy.execute(payload);

            const paymentWithToken = { ...payload.payment };
            (paymentWithToken.paymentData as CreditCard)
                .extraData = { riskToken: testRiskToken };

            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
            expect(placeOrderService.submitPayment)
                .toHaveBeenCalledWith(paymentWithToken, false, undefined);
        });
    });
});
