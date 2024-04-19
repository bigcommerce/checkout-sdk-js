import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge, noop, omit } from 'lodash';

import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    OrderActionType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodCancelledError,
    PaymentMethodInvalidError,
    RemoteCheckoutActionType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getOrderRequestBody,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { getKlarna } from '../klarnav2/klarnav2.mock';

import KlarnaCredit from './klarna-credit';
import KlarnaPaymentStrategy from './klarna-payment-strategy';
import KlarnaScriptLoader from './klarna-script-loader';
import {
    getEUBillingAddress,
    getEUBillingAddressWithNoPhone,
    getKlarnaUpdateSessionParams,
    getKlarnaUpdateSessionParamsForOC,
    getKlarnaUpdateSessionParamsPhone,
    getOCBillingAddress,
} from './klarna.mock';

describe('KlarnaPaymentStrategy', () => {
    let initializePaymentAction: RemoteCheckoutActionType;
    let klarnaCredit: KlarnaCredit;
    let loadPaymentMethodAction: Promise<PaymentMethod>;
    let payload: OrderRequestBody;
    let paymentMethod: PaymentMethod;
    let scriptLoader: KlarnaScriptLoader;
    let submitOrderAction: OrderActionType;
    let strategy: KlarnaPaymentStrategy;
    let paymentMethodMock: PaymentMethod;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        paymentMethodMock = { ...getKlarna(), clientToken: 'foo' };
        scriptLoader = new KlarnaScriptLoader(createScriptLoader());
        strategy = new KlarnaPaymentStrategy(paymentIntegrationService, scriptLoader);

        klarnaCredit = {
            authorize: jest.fn((_, callback) =>
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/naming-convention, @typescript-eslint/no-unsafe-call
                callback({ approved: true, authorization_token: 'bar' }),
            ),
            init: jest.fn(noop),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/naming-convention, @typescript-eslint/no-unsafe-call
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

        loadPaymentMethodAction = Promise.resolve(paymentMethodMock);
        initializePaymentAction = RemoteCheckoutActionType.InitializeRemotePaymentRequested;
        submitOrderAction = OrderActionType.SubmitOrderRequested;

        jest.spyOn(paymentIntegrationService, 'submitOrder').mockReturnValue(submitOrderAction);

        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockReturnValue(
            loadPaymentMethodAction,
        );

        jest.spyOn(paymentIntegrationService, 'initializePayment').mockReturnValue(
            initializePaymentAction,
        );

        jest.spyOn(scriptLoader, 'load').mockImplementation(() => Promise.resolve(klarnaCredit));

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethod').mockReturnValue(
            paymentMethodMock,
        );

        jest.spyOn(paymentIntegrationService, 'subscribe');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize()', () => {
        const onLoad = jest.fn();

        beforeEach(async () => {
            await strategy.initialize({
                methodId: paymentMethod.id,
                klarna: { container: '#container', onLoad },
            });
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('loads script when initializing strategy', () => {
            expect(scriptLoader.load).toHaveBeenCalledTimes(1);
        });

        it('loads payment data from API', () => {
            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith('klarna');
        });

        it('loads store subscribe once', () => {
            expect(paymentIntegrationService.subscribe).toHaveBeenCalledTimes(1);
        });

        it('loads widget', () => {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(klarnaCredit.init).toHaveBeenCalledWith({ client_token: 'foo' });
            expect(klarnaCredit.load).toHaveBeenCalledWith(
                { container: '#container' },
                expect.any(Function),
            );
            expect(klarnaCredit.load).toHaveBeenCalledTimes(1);
        });

        it('triggers callback with response', () => {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(onLoad).toHaveBeenCalledWith({ show_form: true });
        });

        it('throws InvalidArgumentError error if options.klarna  is undefined', async () => {
            try {
                await strategy.initialize({
                    methodId: paymentMethod.id,
                    klarna: undefined,
                });
            } catch (error) {
                // eslint-disable-next-line jest/no-conditional-expect
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throw MissingDataError if paymentMethod is not existing', async () => {
            const rejectedInitialization = jest.fn();

            strategy = new KlarnaPaymentStrategy(paymentIntegrationService, scriptLoader);
            jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethod').mockReturnValue(
                undefined,
            );

            await strategy
                .initialize({
                    methodId: paymentMethod.id,
                    gatewayId: paymentMethod.gateway,
                    klarna: { container: '#container', onLoad },
                })
                .catch(rejectedInitialization);

            expect(rejectedInitialization).toHaveBeenCalledWith(
                new MissingDataError(MissingDataErrorType.MissingPaymentMethod),
            );
        });
    });

    describe('#execute()', () => {
        beforeEach(async () => {
            await strategy.initialize({
                methodId: paymentMethod.id,
                klarna: { container: '#container' },
            });
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('throws error if payment is undefined', async () => {
            payload.payment = undefined;

            try {
                await strategy.execute(payload);
            } catch (error) {
                // eslint-disable-next-line jest/no-conditional-expect
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('authorizes against klarna', async () => {
            await strategy.execute(payload);

            expect(klarnaCredit.authorize).toHaveBeenCalledWith({}, expect.any(Function));
        });

        it('loads widget in EU', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockReturnValue(
                getEUBillingAddress(),
            );

            strategy = new KlarnaPaymentStrategy(paymentIntegrationService, scriptLoader);

            jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethod').mockReturnValue(
                paymentMethodMock,
            );

            await strategy.initialize({
                methodId: paymentMethod.id,
                klarna: { container: '#container' },
            });
            await strategy.execute(payload);

            expect(klarnaCredit.authorize).toHaveBeenCalledWith(
                getKlarnaUpdateSessionParamsPhone(),
                expect.any(Function),
            );
        });

        it('loads widget in OC', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockReturnValue(
                getOCBillingAddress(),
            );

            strategy = new KlarnaPaymentStrategy(paymentIntegrationService, scriptLoader);
            jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethod').mockReturnValue(
                paymentMethodMock,
            );

            await strategy.initialize({
                methodId: paymentMethod.id,
                klarna: { container: '#container' },
            });
            await strategy.execute(payload);

            expect(klarnaCredit.authorize).toHaveBeenCalledWith(
                getKlarnaUpdateSessionParamsForOC(),
                expect.any(Function),
            );
        });

        it('loads widget in EU with no phone', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockReturnValue(
                getEUBillingAddressWithNoPhone(),
            );

            strategy = new KlarnaPaymentStrategy(paymentIntegrationService, scriptLoader);
            jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethod').mockReturnValue(
                paymentMethodMock,
            );

            await strategy.initialize({
                methodId: paymentMethod.id,
                klarna: { container: '#container' },
            });

            await strategy.execute(payload);

            expect(klarnaCredit.authorize).toHaveBeenCalledWith(
                getKlarnaUpdateSessionParams(),
                expect.any(Function),
            );
        });

        it('submits authorization token', async () => {
            await strategy.execute(payload);

            expect(paymentIntegrationService.initializePayment).toHaveBeenCalledWith('klarna', {
                authorizationToken: 'bar',
            });

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                { ...payload, payment: omit(payload.payment, 'paymentData'), useStoreCredit: true },
                undefined,
            );
        });

        it('throws error if required data is not loaded', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockReturnValue(
                undefined,
            );

            strategy = new KlarnaPaymentStrategy(paymentIntegrationService, scriptLoader);

            await strategy.initialize({
                methodId: paymentMethod.id,
                klarna: { container: '#container' },
            });

            try {
                await strategy.execute(payload);
            } catch (error) {
                // eslint-disable-next-line jest/no-conditional-expect
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        describe('when klarna authorization is not approved', () => {
            beforeEach(() => {
                klarnaCredit.authorize = jest.fn((_, callback) =>
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/naming-convention, @typescript-eslint/no-unsafe-call
                    callback({ approved: false, show_form: true }),
                );
            });

            afterEach(() => {
                jest.clearAllMocks();
            });

            it('rejects the payment execution with cancelled payment error', async () => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getBillingAddress',
                ).mockReturnValue(getEUBillingAddress());

                const rejectedSpy = jest.fn();

                await strategy.execute(payload).catch(rejectedSpy);

                expect(rejectedSpy).toHaveBeenCalledWith(new PaymentMethodCancelledError());

                expect(paymentIntegrationService.submitOrder).not.toHaveBeenCalled();
                expect(paymentIntegrationService.initializePayment).not.toHaveBeenCalled();
            });
        });

        describe('when klarna authorization fails', () => {
            beforeEach(() => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
                klarnaCredit.authorize = jest.fn((_, callback) => callback({ approved: false }));
            });

            afterEach(() => {
                jest.clearAllMocks();
            });

            it('rejects the payment execution with invalid payment error', async () => {
                const rejectedSpy = jest.fn();

                await strategy.execute(payload).catch(rejectedSpy);

                expect(rejectedSpy).toHaveBeenCalledWith(new PaymentMethodInvalidError());

                expect(paymentIntegrationService.submitOrder).not.toHaveBeenCalled();
                expect(paymentIntegrationService.initializePayment).not.toHaveBeenCalled();
            });
        });

        describe('when klarna initialization fails', () => {
            beforeEach(() => {
                scriptLoader.load = jest.fn().mockResolvedValue(undefined);
            });

            afterEach(() => {
                jest.clearAllMocks();
            });

            it('rejects the payment execution with NotInitializedError error', async () => {
                const rejectedInitialization = jest.fn();
                const rejectedExecute = jest.fn();
                const onLoad = jest.fn();

                await strategy
                    .initialize({
                        methodId: paymentMethod.id,
                        gatewayId: paymentMethod.gateway,
                        klarna: { container: '#container', onLoad },
                    })
                    .catch(rejectedInitialization);

                expect(rejectedInitialization).toHaveBeenCalledWith(
                    new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
                );

                await strategy.execute(payload).catch(rejectedExecute);

                expect(rejectedExecute).toHaveBeenCalledWith(
                    new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
                );
            });
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            try {
                await strategy.finalize();
            } catch (error) {
                // eslint-disable-next-line jest/no-conditional-expect
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            const result = await strategy.deinitialize();

            expect(result).toBeUndefined();
        });

        it('deinitializes strategy after initialization', async () => {
            const unsubscribe = jest.fn();

            jest.spyOn(paymentIntegrationService, 'subscribe').mockReturnValue(unsubscribe);

            const onLoad = jest.fn();

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
                klarna: { container: '#container', onLoad },
            });

            const result = await strategy.deinitialize();

            expect(result).toBeUndefined();
            expect(unsubscribe).toHaveBeenCalledTimes(1);
        });
    });
});
