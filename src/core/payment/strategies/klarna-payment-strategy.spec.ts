import { merge } from 'lodash';
import { createClient as createPaymentClient } from 'bigpay-client';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { CartActionCreator } from '../../cart';
import { createCheckoutClient, createCheckoutStore, CheckoutClient, CheckoutStore } from '../../checkout';
import { createPlaceOrderService, OrderRequestBody, PlaceOrderService } from '../../order';
import { createRemoteCheckoutService, RemoteCheckoutService } from '../../remote-checkout';
import { KlarnaScriptLoader } from '../../remote-checkout/methods/klarna';
import { RemoteCheckoutPaymentError, RemoteCheckoutSessionError } from '../../remote-checkout/errors';
import { getKlarna } from '../../payment/payment-methods.mock';
import { getIncompleteOrder, getOrderRequestBody } from '../../order/orders.mock';
import { getResponse } from '../../common/http-request/responses.mock';
import KlarnaPaymentStrategy from './klarna-payment-strategy';
import PaymentMethod from '../payment-method';

describe('KlarnaPaymentStrategy', () => {
    let client: CheckoutClient;
    let scriptLoader: KlarnaScriptLoader;
    let store: CheckoutStore;
    let strategy: KlarnaPaymentStrategy;
    let remoteCheckoutService: RemoteCheckoutService;
    let paymentMethod: PaymentMethod;
    let placeOrderService: PlaceOrderService;
    let payload: OrderRequestBody;

    const clientToken: string = 'foo';
    const klarnaSdk = {
        authorize: (a, b) => Promise.resolve({ approved: true }),
        init: () => Promise.resolve(),
        load: () => Promise.resolve(),
    };

    beforeEach(() => {
        client = createCheckoutClient();
        store = createCheckoutStore();
        placeOrderService = createPlaceOrderService(store, client, createPaymentClient());
        remoteCheckoutService = createRemoteCheckoutService(store, client);
        paymentMethod = getKlarna();
        scriptLoader = new KlarnaScriptLoader(createScriptLoader());
        strategy = new KlarnaPaymentStrategy(
            store,
            placeOrderService,
            remoteCheckoutService,
            scriptLoader
        );

        jest.spyOn(remoteCheckoutService, 'initializePayment').mockImplementation(() => {
            return Promise.resolve({});
        });

        jest.spyOn(placeOrderService, 'loadPaymentMethod').mockImplementation(() => {
            return Promise.resolve({
                checkout: {
                    getPaymentMethod: () => {
                        return { clientToken };
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

        jest.spyOn(klarnaSdk, 'init');
        jest.spyOn(klarnaSdk, 'load');
        jest.spyOn(klarnaSdk, 'authorize');

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                name: paymentMethod.id,
                gateway: paymentMethod.gateway,
            },
        });
    });

    describe('#initialize()', () => {
        beforeEach(async () => {
            klarnaSdk.load.mockReset();
            await strategy.initialize({ paymentMethod });
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
            await strategy.initialize({ paymentMethod });
        });

        it('authorizes against klarna', () => {
            strategy.execute(payload);
            expect(klarnaSdk.authorize).toHaveBeenCalledTimes(1);
        });

        it('submits authorization token', async () => {
            const authorizationToken = 'bar';
            jest.spyOn(strategy, '_authorize')
                .mockImplementation(() => Promise.resolve({ authorization_token: authorizationToken }));

            await strategy.execute(payload);

            expect(remoteCheckoutService.initializePayment)
                .toHaveBeenCalledWith('klarna', { authorizationToken });

            expect(placeOrderService.submitOrder)
                .toHaveBeenCalled();
        });
    });
});
