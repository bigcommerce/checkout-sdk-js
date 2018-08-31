import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge, omit } from 'lodash';
import { Observable } from 'rxjs';

import {
    createCheckoutClient,
    createCheckoutStore,
    CheckoutClient,
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator
} from '../../../checkout';
import { OrderActionCreator, OrderActionType, OrderRequestBody } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { getKlarna, getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { INITIALIZE_REMOTE_PAYMENT_REQUESTED } from '../../../remote-checkout/remote-checkout-action-types';
import { PaymentMethodCancelledError, PaymentMethodInvalidError } from '../../errors';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentMethodActionType } from '../../payment-method-actions';
import PaymentMethodRequestSender from '../../payment-method-request-sender';

import KlarnaCredit from './klarna-credit';
import KlarnaPaymentStrategy from './klarna-payment-strategy';
import KlarnaScriptLoader from './klarna-script-loader';

describe('KlarnaPaymentStrategy', () => {
    let client: CheckoutClient;
    let initializePaymentAction: Observable<Action>;
    let klarnaCredit: KlarnaCredit;
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
        orderActionCreator = new OrderActionCreator(
            client,
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender()))
        );
        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(createRequestSender()));
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

        klarnaCredit = {
            authorize: jest.fn((params, callback) => callback({ approved: true, authorization_token: 'bar' })),
            init: jest.fn(() => {}),
            load: jest.fn((options, callback) => callback({ show_form: true })),
        };

        paymentMethod = getKlarna();

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            },
        });

        loadPaymentMethodAction = Observable.of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethod, { methodId: paymentMethod.id }));
        initializePaymentAction = Observable.of(createAction(INITIALIZE_REMOTE_PAYMENT_REQUESTED));
        submitOrderAction = Observable.of(createAction(OrderActionType.SubmitOrderRequested));

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(loadPaymentMethodAction);

        jest.spyOn(remoteCheckoutActionCreator, 'initializePayment')
            .mockReturnValue(initializePaymentAction);

        jest.spyOn(scriptLoader, 'load')
            .mockImplementation(() => Promise.resolve(klarnaCredit));

        jest.spyOn(store, 'subscribe');
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

        it('loads store subscribe once', () => {
            expect(store.subscribe).toHaveBeenCalledTimes(1);
        });

        it('loads widget', () => {
            expect(klarnaCredit.init).toHaveBeenCalledWith({ client_token: 'foo' });
            expect(klarnaCredit.load).toHaveBeenCalledTimes(1);
        });

        it('triggers callback with response', () => {
            expect(onLoad).toHaveBeenCalledWith({ show_form: true });
        });

        describe('on subsequent calls', () => {
            beforeEach(async () => {
                await strategy.initialize({ methodId: paymentMethod.id, klarna: { container: '#container', onLoad } });
                await strategy.initialize({ methodId: paymentMethod.id, klarna: { container: '#container', onLoad } });
            });

            it('does not call anything again', async () => {
                expect(store.subscribe).toHaveBeenCalledTimes(1);
                expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledTimes(1);
                expect(klarnaCredit.init).toHaveBeenCalledTimes(1);
                expect(klarnaCredit.load).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('#execute()', () => {
        beforeEach(async () => {
            await strategy.initialize({ methodId: paymentMethod.id, klarna: { container: '#container' } });
        });

        it('authorizes against klarna', () => {
            strategy.execute(payload);
            expect(klarnaCredit.authorize).toHaveBeenCalledTimes(1);
        });

        it('submits authorization token', async () => {
            await strategy.execute(payload);

            expect(remoteCheckoutActionCreator.initializePayment)
                .toHaveBeenCalledWith('klarna', { authorizationToken: 'bar' });

            expect(orderActionCreator.submitOrder)
                .toHaveBeenCalledWith({ ...payload, payment: omit(payload.payment, 'paymentData'), useStoreCredit: false }, undefined);

            expect(store.dispatch).toHaveBeenCalledWith(initializePaymentAction);
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        describe('when klarna authorizaron is not approved', () => {
            beforeEach(async () => {
                klarnaCredit.authorize = jest.fn(
                    (params, callback) => callback({ approved: false, show_form: true })
                );
            });

            it('rejects the payment execution with cancelled payment error', async () => {
                const rejectedSpy = jest.fn();
                await strategy.execute(payload).catch(rejectedSpy);

                expect(rejectedSpy)
                    .toHaveBeenCalledWith(new PaymentMethodCancelledError());

                expect(orderActionCreator.submitOrder).not.toHaveBeenCalled();
                expect(remoteCheckoutActionCreator.initializePayment)
                    .not.toHaveBeenCalled();
            });
        });

        describe('when klarna authorizaron fails', () => {
            beforeEach(async () => {
                klarnaCredit.authorize = jest.fn(
                    (params, callback) => callback({ approved: false })
                );
            });

            it('rejects the payment execution with invalid payment error', async () => {
                const rejectedSpy = jest.fn();
                await strategy.execute(payload).catch(rejectedSpy);

                expect(rejectedSpy)
                    .toHaveBeenCalledWith(new PaymentMethodInvalidError());

                expect(orderActionCreator.submitOrder).not.toHaveBeenCalled();
                expect(remoteCheckoutActionCreator.initializePayment)
                    .not.toHaveBeenCalled();
            });
        });
    });
});
