import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { Observable } from 'rxjs';

import { createCheckoutClient, createCheckoutStore, CheckoutClient, CheckoutStore } from '../../checkout';
import { createPlaceOrderService, OrderRequestBody, PlaceOrderService } from '../../order';
import { getOrderRequestBody } from '../../order/internal-orders.mock';
import { getKlarna } from '../../payment/payment-methods.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../remote-checkout';
import { KlarnaScriptLoader } from '../../remote-checkout/methods/klarna';
import { INITIALIZE_REMOTE_PAYMENT_REQUESTED } from '../../remote-checkout/remote-checkout-action-types';
import PaymentMethod from '../payment-method';
import PaymentMethodActionCreator from '../payment-method-action-creator';
import { LOAD_PAYMENT_METHOD_SUCCEEDED } from '../payment-method-action-types';

import KlarnaPaymentStrategy from './klarna-payment-strategy';

describe('KlarnaPaymentStrategy', () => {
    let client: CheckoutClient;
    let initializePaymentAction: Observable<Action>;
    let klarnaSdk: Klarna.Sdk;
    let loadPaymentMethodAction: Observable<Action>;
    let payload: OrderRequestBody;
    let paymentMethod: PaymentMethod;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let placeOrderService: PlaceOrderService;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let scriptLoader: KlarnaScriptLoader;
    let store: CheckoutStore;
    let strategy: KlarnaPaymentStrategy;

    beforeEach(() => {
        client = createCheckoutClient();
        store = createCheckoutStore();
        placeOrderService = createPlaceOrderService(store, client, createPaymentClient());
        paymentMethodActionCreator = new PaymentMethodActionCreator(client);
        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(createRequestSender())
        );
        scriptLoader = new KlarnaScriptLoader(createScriptLoader());
        strategy = new KlarnaPaymentStrategy(
            store,
            placeOrderService,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            scriptLoader
        );

        klarnaSdk = {
            authorize: jest.fn((a, b) => Promise.resolve({ approved: true })),
            init: jest.fn(() => Promise.resolve()),
            load: jest.fn(() => Promise.resolve()),
        };

        paymentMethod = getKlarna();

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                name: paymentMethod.id,
                gateway: paymentMethod.gateway,
            },
        });

        loadPaymentMethodAction = Observable.of(createAction(LOAD_PAYMENT_METHOD_SUCCEEDED, { paymentMethod }, { methodId: paymentMethod.id }));
        initializePaymentAction = Observable.of(createAction(INITIALIZE_REMOTE_PAYMENT_REQUESTED));

        jest.spyOn(store, 'dispatch');

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(loadPaymentMethodAction);

        jest.spyOn(remoteCheckoutActionCreator, 'initializePayment')
            .mockReturnValue(initializePaymentAction);

        jest.spyOn(placeOrderService, 'submitOrder')
            .mockImplementation(() => Promise.resolve());

        jest.spyOn(scriptLoader, 'load')
            .mockImplementation(() => Promise.resolve(klarnaSdk));

        jest.spyOn(store, 'subscribe')
            .mockImplementation(() => Promise.resolve());
    });

    describe('#initialize()', () => {
        beforeEach(async () => {
            await strategy.initialize({ container: '#container', paymentMethod });
        });

        it('loads script when initializing strategy', () => {
            expect(scriptLoader.load).toHaveBeenCalledTimes(1);
        });

        it('loads payment data from API', () => {
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledWith('klarna');
            expect(store.dispatch).toHaveBeenCalledWith(loadPaymentMethodAction);
        });

        it('loads widget', () => {
            expect(klarnaSdk.init).toHaveBeenCalledWith({ client_token: 'foo' });
            expect(klarnaSdk.load).toHaveBeenCalledTimes(1);
        });
    });

    describe('#execute()', () => {
        beforeEach(async () => {
            await strategy.initialize({ container: '#container', paymentMethod });
        });

        it('authorizes against klarna', () => {
            strategy.execute(payload);
            expect(klarnaSdk.authorize).toHaveBeenCalledTimes(1);
        });

        it('submits authorization token', async () => {
            const authorizationToken = 'bar';

            jest.spyOn(klarnaSdk, 'authorize')
                .mockImplementation((params, callback) => callback({
                    approved: true,
                    authorization_token: authorizationToken,
                }));

            await strategy.execute(payload);

            expect(remoteCheckoutActionCreator.initializePayment)
                .toHaveBeenCalledWith('klarna', { authorizationToken });

            expect(store.dispatch).toHaveBeenCalledWith(initializePaymentAction);

            expect(placeOrderService.submitOrder)
                .toHaveBeenCalled();
        });
    });
});
