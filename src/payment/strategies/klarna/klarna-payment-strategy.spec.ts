import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge, omit } from 'lodash';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { MissingDataError } from '../../../common/error/errors';
import { OrderActionCreator, OrderActionType, OrderRequestBody, OrderRequestSender } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutActionType, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { PaymentMethodCancelledError, PaymentMethodInvalidError } from '../../errors';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentMethodActionType } from '../../payment-method-actions';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { getKlarna } from '../../payment-methods.mock';

import KlarnaCredit from './klarna-credit';
import KlarnaPaymentStrategy from './klarna-payment-strategy';
import KlarnaScriptLoader from './klarna-script-loader';
import { getEUBillingAddress, getEUBillingAddressWithNoPhone, getKlarnaUpdateSessionParams, getKlarnaUpdateSessionParamsForOC, getKlarnaUpdateSessionParamsPhone, getOCBillingAddress } from './klarna.mock';

describe('KlarnaPaymentStrategy', () => {
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
    let paymentMethodMock: PaymentMethod;

    beforeEach(() => {
        paymentMethodMock = { ...getKlarna(), clientToken: 'foo' };
        store = createCheckoutStore(getCheckoutStoreState());

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(paymentMethodMock);

        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(createRequestSender()),
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
            authorize: jest.fn((_, callback) => callback({ approved: true, authorization_token: 'bar' })),
            init: jest.fn(() => {}),
            load: jest.fn((_, callback) => callback({ show_form: true })),
        };

        paymentMethod = getKlarna();

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            },
            useStoreCredit: true,
        });

        loadPaymentMethodAction = of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethod, { methodId: paymentMethod.id }));
        initializePaymentAction = of(createAction(RemoteCheckoutActionType.InitializeRemotePaymentRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));

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
            expect(klarnaCredit.load)
                .toHaveBeenCalledWith({ container: '#container' }, expect.any(Function));
            expect(klarnaCredit.load).toHaveBeenCalledTimes(1);
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
            expect(klarnaCredit.authorize).toHaveBeenCalledWith({}, expect.any(Function));
        });

        it('loads widget in EU', async () => {
            store = store = createCheckoutStore({
                ...getCheckoutStoreState(),
                billingAddress: { data: getEUBillingAddress(), errors: {}, statuses: {} },
            });
            strategy = new KlarnaPaymentStrategy(
                store,
                orderActionCreator,
                paymentMethodActionCreator,
                remoteCheckoutActionCreator,
                scriptLoader
            );
            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(paymentMethodMock);

            await strategy.initialize({ methodId: paymentMethod.id, klarna: { container: '#container' } });
            strategy.execute(payload);

            expect(klarnaCredit.authorize)
                .toHaveBeenCalledWith(getKlarnaUpdateSessionParamsPhone(), expect.any(Function));
        });

        it('loads widget in OC', async () => {
            store = store = createCheckoutStore({
                ...getCheckoutStoreState(),
                billingAddress: { data: getOCBillingAddress(), errors: {}, statuses: {} },
            });
            strategy = new KlarnaPaymentStrategy(
                store,
                orderActionCreator,
                paymentMethodActionCreator,
                remoteCheckoutActionCreator,
                scriptLoader
            );
            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(paymentMethodMock);

            await strategy.initialize({ methodId: paymentMethod.id, klarna: { container: '#container' } });
            strategy.execute(payload);

            expect(klarnaCredit.authorize)
                .toHaveBeenCalledWith(getKlarnaUpdateSessionParamsForOC(), expect.any(Function));
        });

        it('loads widget in EU with no phone', async () => {
            store = store = createCheckoutStore({
                ...getCheckoutStoreState(),
                billingAddress: { data: getEUBillingAddressWithNoPhone(), errors: {}, statuses: {} },
            });
            strategy = new KlarnaPaymentStrategy(
                store,
                orderActionCreator,
                paymentMethodActionCreator,
                remoteCheckoutActionCreator,
                scriptLoader
            );
            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(paymentMethodMock);

            await strategy.initialize({ methodId: paymentMethod.id, klarna: { container: '#container' } });

            strategy.execute(payload);

            expect(klarnaCredit.authorize)
                .toHaveBeenCalledWith(getKlarnaUpdateSessionParams(), expect.any(Function));
        });

        it('throws error if required data is not loaded', async () => {
            store = store = createCheckoutStore({
                ...getCheckoutStoreState(),
                billingAddress: undefined,
            });
            strategy = new KlarnaPaymentStrategy(
                store,
                orderActionCreator,
                paymentMethodActionCreator,
                remoteCheckoutActionCreator,
                scriptLoader
            );

            strategy.initialize({ methodId: paymentMethod.id, klarna: { container: '#container' } });

            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('submits authorization token', async () => {
            await strategy.execute(payload);

            expect(remoteCheckoutActionCreator.initializePayment)
                .toHaveBeenCalledWith('klarna', { authorizationToken: 'bar' });

            expect(orderActionCreator.submitOrder)
                .toHaveBeenCalledWith({ ...payload, payment: omit(payload.payment, 'paymentData'), useStoreCredit: true }, undefined);

            expect(store.dispatch).toHaveBeenCalledWith(initializePaymentAction);
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        describe('when klarna authorization is not approved', () => {
            beforeEach(() => {
                klarnaCredit.authorize = jest.fn(
                    (_, callback) => callback({ approved: false, show_form: true })
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

        describe('when klarna authorization fails', () => {
            beforeEach(() => {
                klarnaCredit.authorize = jest.fn(
                    (_, callback) => callback({ approved: false })
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

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            try {
                await strategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });
    });
});
