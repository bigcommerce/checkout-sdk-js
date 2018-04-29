import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge, omit } from 'lodash';
import { Observable } from 'rxjs';

import { createCheckoutClient, createCheckoutStore, CheckoutClient, CheckoutStore } from '../../checkout';
import { OrderActionCreator, OrderRequestBody } from '../../order';
import { getOrderRequestBody } from '../../order/internal-orders.mock';
import { SUBMIT_ORDER_REQUESTED } from '../../order/order-action-types';
import { getKlarna, getPaymentMethodsState } from '../../payment/payment-methods.mock';
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
    let orderActionCreator: OrderActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let scriptLoader: KlarnaScriptLoader;
    let submitOrderAction: Observable<Action>;
    let store: CheckoutStore;
    let strategy: KlarnaPaymentStrategy;

    beforeEach(() => {
        client = createCheckoutClient();
        store = createCheckoutStore({
            paymentMethods: getPaymentMethodsState(),
        });
        orderActionCreator = new OrderActionCreator(client);
        paymentMethodActionCreator = new PaymentMethodActionCreator(client);
        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(createRequestSender())
        );
        scriptLoader = new KlarnaScriptLoader(createScriptLoader());
        strategy = new KlarnaPaymentStrategy(
            store,
            orderActionCreator,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            scriptLoader
        );

        klarnaSdk = {
            authorize: jest.fn((params, callback) => callback({ approved: true, authorization_token: 'bar' })),
            init: jest.fn(() => {}),
            load: jest.fn((options, callback) => callback({ show_form: true })),
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
        submitOrderAction = Observable.of(createAction(SUBMIT_ORDER_REQUESTED));

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(loadPaymentMethodAction);

        jest.spyOn(remoteCheckoutActionCreator, 'initializePayment')
            .mockReturnValue(initializePaymentAction);

        jest.spyOn(scriptLoader, 'load')
            .mockImplementation(() => Promise.resolve(klarnaSdk));

        jest.spyOn(store, 'subscribe')
            .mockImplementation(() => Promise.resolve());
    });

    describe('#initialize()', () => {
        const onLoad = jest.fn();

        beforeEach(async () => {
            await strategy.initialize({ methodId: paymentMethod.id, klarna: { container: '#container', onLoad } });
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

        it('triggers callback with response', () => {
            expect(onLoad).toHaveBeenCalledWith({ show_form: true });
        });
    });

    describe('#execute()', () => {
        beforeEach(async () => {
            await strategy.initialize({ methodId: paymentMethod.id, klarna: { container: '#container' } });
        });

        it('authorizes against klarna', () => {
            strategy.execute(payload);
            expect(klarnaSdk.authorize).toHaveBeenCalledTimes(1);
        });

        it('submits authorization token', async () => {
            await strategy.execute(payload);

            expect(remoteCheckoutActionCreator.initializePayment)
                .toHaveBeenCalledWith('klarna', { authorizationToken: 'bar' });

            expect(orderActionCreator.submitOrder)
                .toHaveBeenCalledWith({ ...payload, payment: omit(payload.payment, 'paymentData'), useStoreCredit: false }, true, undefined);

            expect(store.dispatch).toHaveBeenCalledWith(initializePaymentAction);
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });
    });
});
