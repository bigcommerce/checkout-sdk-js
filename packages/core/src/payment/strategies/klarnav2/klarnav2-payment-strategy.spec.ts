import { Action, createAction } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge, noop, omit } from 'lodash';
import { Observable, of } from 'rxjs';

import { PaymentMethodInvalidError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import {
    OrderActionCreator,
    OrderActionType,
    OrderRequestBody,
    OrderRequestSender,
} from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import {
    RemoteCheckoutActionCreator,
    RemoteCheckoutActionType,
    RemoteCheckoutRequestSender,
} from '../../../remote-checkout';
import { PaymentMethodCancelledError } from '../../errors';
import PaymentMethod from '../../payment-method';
import { getKlarna } from '../../payment-methods.mock';

import KlarnaPayments from './klarna-payments';
import KlarnaV2PaymentStrategy from './klarnav2-payment-strategy';
import KlarnaV2ScriptLoader from './klarnav2-script-loader';
import KlarnaV2TokenUpdater from './klarnav2-token-updater';
import {
    getEUBillingAddress,
    getEUBillingAddressWithNoPhone,
    getEUShippingAddress,
    getKlarnaV2UpdateSessionParams,
    getKlarnaV2UpdateSessionParamsForOC,
    getKlarnaV2UpdateSessionParamsPhone,
    getOCBillingAddress,
} from './klarnav2.mock';

describe('KlarnaV2PaymentStrategy', () => {
    let checkoutActionCreator: CheckoutActionCreator;
    let initializePaymentAction: Observable<Action>;
    let klarnaPayments: KlarnaPayments;
    let payload: OrderRequestBody;
    let paymentMethod: PaymentMethod;
    let orderActionCreator: OrderActionCreator;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let requestSender: RequestSender;
    let scriptLoader: KlarnaV2ScriptLoader;
    let submitOrderAction: Observable<Action>;
    let store: CheckoutStore;
    let strategy: KlarnaV2PaymentStrategy;
    let paymentMethodMock: PaymentMethod;
    let klarnav2TokenUpdater: KlarnaV2TokenUpdater;

    beforeEach(() => {
        paymentMethodMock = { ...getKlarna(), id: 'pay_now', gateway: 'klarna' };
        store = createCheckoutStore(getCheckoutStoreState());

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );
        jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(
            getEUBillingAddress(),
        );
        jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue(
            getEUShippingAddress(),
        );

        requestSender = createRequestSender();

        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(requestSender),
            new CheckoutValidator(new CheckoutRequestSender(requestSender)),
        );

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender)),
        );
        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(requestSender),
            checkoutActionCreator,
        );
        scriptLoader = new KlarnaV2ScriptLoader(createScriptLoader());
        klarnav2TokenUpdater = new KlarnaV2TokenUpdater(requestSender);
        strategy = new KlarnaV2PaymentStrategy(
            store,
            orderActionCreator,
            remoteCheckoutActionCreator,
            scriptLoader,
            klarnav2TokenUpdater,
        );

        klarnaPayments = {
            authorize: jest.fn((_params, _data, callback) => {
                callback({ approved: true, authorization_token: 'bar' });
            }),
            init: jest.fn(noop),
            load: jest.fn((_, callback) => callback({ show_form: true })),
        };

        paymentMethod = { ...getKlarna(), id: 'pay_now', gateway: 'klarna' };

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            },
            useStoreCredit: true,
        });

        initializePaymentAction = of(
            createAction(RemoteCheckoutActionType.InitializeRemotePaymentRequested),
        );
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(submitOrderAction);

        jest.spyOn(remoteCheckoutActionCreator, 'initializePayment').mockReturnValue(
            initializePaymentAction,
        );

        jest.spyOn(scriptLoader, 'load').mockImplementation(() => Promise.resolve(klarnaPayments));

        jest.spyOn(klarnav2TokenUpdater, 'updateClientToken').mockResolvedValue(
            getResponse(getKlarna()),
        );

        jest.spyOn(store, 'subscribe');
    });

    describe('#initialize()', () => {
        const onLoad = jest.fn();

        beforeEach(async () => {
            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
                klarnav2: { container: '#container', onLoad },
            });
        });

        it('throws InvalidArgumentError when klarnav2 is not provided', async () => {
            const rejectedSpy = jest.fn();

            await strategy
                .initialize({
                    methodId: paymentMethod.id,
                    gatewayId: paymentMethod.gateway,
                    klarna: { container: '#container', onLoad },
                })
                .catch(rejectedSpy);

            expect(rejectedSpy).toHaveBeenCalledWith(
                new InvalidArgumentError(
                    'Unable to load widget because "options.klarnav2" argument is not provided.',
                ),
            );
        });

        it('loads script when initializing strategy', () => {
            expect(scriptLoader.load).toHaveBeenCalledTimes(1);
        });

        it('loads store subscribe once', () => {
            store.notifyState();

            expect(store.subscribe).toHaveBeenCalledTimes(1);
        });

        it('loads payments widget', () => {
            expect(klarnaPayments.init).toHaveBeenCalledWith({ client_token: 'foo' });
            expect(klarnaPayments.load).toHaveBeenCalledWith(
                { container: '#container', payment_method_category: paymentMethod.id },
                expect.any(Function),
            );
            expect(klarnaPayments.load).toHaveBeenCalledTimes(1);
        });

        it('triggers callback with response', () => {
            expect(onLoad).toHaveBeenCalledWith({ show_form: true });
        });
    });

    describe('#execute()', () => {
        beforeEach(async () => {
            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
                klarnav2: { container: '#container' },
            });
        });

        it('authorizes against klarnav2', () => {
            strategy.execute(payload);

            expect(klarnaPayments.authorize).toHaveBeenCalledWith(
                { payment_method_category: paymentMethod.id },
                getKlarnaV2UpdateSessionParamsPhone(),
                expect.any(Function),
            );
            expect(klarnav2TokenUpdater.updateClientToken).toHaveBeenCalledWith(
                paymentMethod.gateway,
                { params: { params: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7' } },
            );
        });

        it('loads widget in EU', async () => {
            store = store = createCheckoutStore({
                ...getCheckoutStoreState(),
                billingAddress: { data: getEUBillingAddress(), errors: {}, statuses: {} },
            });
            strategy = new KlarnaV2PaymentStrategy(
                store,
                orderActionCreator,
                remoteCheckoutActionCreator,
                scriptLoader,
                klarnav2TokenUpdater,
            );
            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                paymentMethodMock,
            );

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
                klarnav2: { container: '#container' },
            });
            strategy.execute(payload);

            expect(klarnaPayments.authorize).toHaveBeenCalledWith(
                { payment_method_category: paymentMethod.id },
                getKlarnaV2UpdateSessionParamsPhone(),
                expect.any(Function),
            );
        });

        it('loads widget in OC', async () => {
            store = store = createCheckoutStore({
                ...getCheckoutStoreState(),
                billingAddress: { data: getOCBillingAddress(), errors: {}, statuses: {} },
            });
            strategy = new KlarnaV2PaymentStrategy(
                store,
                orderActionCreator,
                remoteCheckoutActionCreator,
                scriptLoader,
                klarnav2TokenUpdater,
            );
            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                paymentMethodMock,
            );

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
                klarnav2: { container: '#container' },
            });
            strategy.execute(payload);

            expect(klarnaPayments.authorize).toHaveBeenCalledWith(
                { payment_method_category: paymentMethod.id },
                getKlarnaV2UpdateSessionParamsForOC(),
                expect.any(Function),
            );
        });

        it('loads widget in EU with no phone', async () => {
            store = store = createCheckoutStore({
                ...getCheckoutStoreState(),
                billingAddress: {
                    data: getEUBillingAddressWithNoPhone(),
                    errors: {},
                    statuses: {},
                },
            });
            strategy = new KlarnaV2PaymentStrategy(
                store,
                orderActionCreator,
                remoteCheckoutActionCreator,
                scriptLoader,
                klarnav2TokenUpdater,
            );
            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                paymentMethodMock,
            );

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
                klarnav2: { container: '#container' },
            });

            strategy.execute(payload);

            expect(klarnaPayments.authorize).toHaveBeenCalledWith(
                { payment_method_category: paymentMethod.id },
                getKlarnaV2UpdateSessionParams(),
                expect.any(Function),
            );
        });

        it('throws error if required data is not loaded', async () => {
            store = store = createCheckoutStore({
                ...getCheckoutStoreState(),
                billingAddress: undefined,
            });
            strategy = new KlarnaV2PaymentStrategy(
                store,
                orderActionCreator,
                remoteCheckoutActionCreator,
                scriptLoader,
                klarnav2TokenUpdater,
            );

            strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
                klarnav2: { container: '#container' },
            });

            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('submits authorization token', async () => {
            await strategy.execute(payload);

            expect(remoteCheckoutActionCreator.initializePayment).toHaveBeenCalledWith('klarna', {
                authorizationToken: 'bar',
            });

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(
                { ...payload, payment: omit(payload.payment, 'paymentData'), useStoreCredit: true },
                undefined,
            );

            expect(store.dispatch).toHaveBeenCalledWith(initializePaymentAction);
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        describe('when klarnav2 authorization is not approved', () => {
            beforeEach(() => {
                klarnaPayments.authorize = jest.fn((_params, _data, callback) =>
                    callback({ approved: false, show_form: true }),
                );
            });

            it('rejects the payment execution with cancelled payment error', async () => {
                const rejectedSpy = jest.fn();

                await strategy.execute(payload).catch(rejectedSpy);

                expect(rejectedSpy).toHaveBeenCalledWith(new PaymentMethodCancelledError());

                expect(orderActionCreator.submitOrder).not.toHaveBeenCalled();
                expect(remoteCheckoutActionCreator.initializePayment).not.toHaveBeenCalled();
            });
        });

        describe('when klarnav2 authorization fails', () => {
            beforeEach(() => {
                klarnaPayments.authorize = jest.fn((_params, _data, callback) =>
                    callback({ approved: false }),
                );
            });

            it('rejects the payment execution with invalid payment error', async () => {
                const rejectedSpy = jest.fn();

                await strategy.execute(payload).catch(rejectedSpy);

                expect(rejectedSpy).toHaveBeenCalledWith(new PaymentMethodInvalidError());

                expect(orderActionCreator.submitOrder).not.toHaveBeenCalled();
                expect(remoteCheckoutActionCreator.initializePayment).not.toHaveBeenCalled();
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
