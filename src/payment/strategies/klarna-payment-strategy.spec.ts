import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { Observable } from 'rxjs';

import { CheckoutClient, CheckoutStore, createCheckoutClient, createCheckoutStore } from '../../checkout';
import { createPlaceOrderService, OrderRequestBody, PlaceOrderService } from '../../order';
import { getOrderRequestBody } from '../../order/internal-orders.mock';
import { getKlarna } from '../../payment/payment-methods.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../remote-checkout';
import { KlarnaScriptLoader } from '../../remote-checkout/methods/klarna';
import { INITIALIZE_REMOTE_PAYMENT_REQUESTED } from '../../remote-checkout/remote-checkout-action-types';
import PaymentMethod from '../payment-method';
import KlarnaPaymentStrategy from './klarna-payment-strategy';

describe('KlarnaPaymentStrategy', () => {
    let client: CheckoutClient;
    let klarnaSdk: Klarna.Sdk;
    let payload: OrderRequestBody;
    let paymentMethod: PaymentMethod;
    let placeOrderService: PlaceOrderService;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let scriptLoader: KlarnaScriptLoader;
    let store: CheckoutStore;
    let strategy: KlarnaPaymentStrategy;

    beforeEach(() => {
        client = createCheckoutClient();
        store = createCheckoutStore();
        placeOrderService = createPlaceOrderService(store, client, createPaymentClient());
        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(createRequestSender())
        );
        scriptLoader = new KlarnaScriptLoader(createScriptLoader());
        strategy = new KlarnaPaymentStrategy(
            store,
            placeOrderService,
            remoteCheckoutActionCreator,
            scriptLoader
        );

        klarnaSdk = {
            authorize: jest.fn((a, b) => Promise.resolve({ approved: true })),
            init: jest.fn(() => Promise.resolve()),
            load: jest.fn(() => Promise.resolve()),
        };

        jest.spyOn(remoteCheckoutActionCreator, 'initializePayment').mockImplementation(() => {
            return Observable.of(createAction(INITIALIZE_REMOTE_PAYMENT_REQUESTED));
        });

        jest.spyOn(placeOrderService, 'loadPaymentMethod').mockImplementation(() => {
            return Promise.resolve({
                checkout: {
                    getPaymentMethod: () => {
                        return { clientToken: 'foo' };
                    },
                },
            });
        });

        jest.spyOn(placeOrderService, 'submitOrder')
            .mockImplementation(() => Promise.resolve());

        jest.spyOn(scriptLoader, 'load')
            .mockImplementation(() => Promise.resolve(klarnaSdk));

        jest.spyOn(store, 'subscribe')
            .mockImplementation(() => Promise.resolve());

        paymentMethod = getKlarna();

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                name: paymentMethod.id,
                gateway: paymentMethod.gateway,
            },
        });
    });

    describe('#initialize()', () => {
        beforeEach(async () => {
            await strategy.initialize({ container: '#container', paymentMethod });
        });

        it('loads script when initializing strategy', () => {
            expect(scriptLoader.load).toHaveBeenCalledTimes(1);
        });

        it('loads payment data from API', () => {
            expect(placeOrderService.loadPaymentMethod).toHaveBeenCalledWith('klarna');
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

            expect(placeOrderService.submitOrder)
                .toHaveBeenCalled();
        });
    });
});
