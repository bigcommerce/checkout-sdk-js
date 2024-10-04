import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { omit } from 'lodash';
import { noop } from 'rxjs';

import {
    Checkout,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodCancelledError,
    PaymentMethodInvalidError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getAddress,
    getCheckout,
    getOrderRequestBody,
    getResponse,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import KlarnaPayments from './klarna-payments';
import KlarnaV2PaymentStrategy from './klarnav2-payment-strategy';
import KlarnaV2ScriptLoader from './klarnav2-script-loader';
import KlarnaV2TokenUpdater from './klarnav2-token-updater';
import {
    getEUBillingAddress,
    getEUBillingAddressWithNoPhone,
    getEUShippingAddress,
    getKlarna,
    getKlarnaV2UpdateSessionParams,
    getKlarnaV2UpdateSessionParamsForOC,
    getKlarnaV2UpdateSessionParamsPhone,
    getOCBillingAddress,
} from './klarnav2.mock';

describe('KlarnaV2PaymentStrategy', () => {
    let checkoutMock: Checkout;
    let klarnaPayments: KlarnaPayments;
    let payload: OrderRequestBody;
    let paymentMethod: PaymentMethod;
    let requestSender: RequestSender;
    let scriptLoader: KlarnaV2ScriptLoader;
    let strategy: KlarnaV2PaymentStrategy;
    let paymentMethodMock: PaymentMethod;
    let klarnav2TokenUpdater: KlarnaV2TokenUpdater;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        requestSender = createRequestSender();
        jest.spyOn(requestSender, 'put').mockImplementation(jest.fn());

        scriptLoader = new KlarnaV2ScriptLoader(createScriptLoader());
        klarnav2TokenUpdater = new KlarnaV2TokenUpdater(requestSender);
        strategy = new KlarnaV2PaymentStrategy(
            paymentIntegrationService,
            scriptLoader,
            klarnav2TokenUpdater,
        );

        paymentMethodMock = { ...getKlarna(), id: 'pay_now', gateway: 'klarna' };

        klarnaPayments = {
            authorize: jest.fn((_params, _data, callback) => {
                callback({ approved: true, authorization_token: 'bar' });
            }),
            init: jest.fn(noop),

            load: jest.fn((_, callback) => callback({ show_form: true })),
        };

        paymentMethod = { ...getKlarna(), id: 'pay_now', gateway: 'klarna' };

        payload = {
            ...getOrderRequestBody(),
            payment: {
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            },
            useStoreCredit: true,
        };

        checkoutMock = getCheckout();

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );
        jest.spyOn(
            paymentIntegrationService.getState(),
            'getBillingAddressOrThrow',
        ).mockReturnValue(getEUBillingAddress());
        jest.spyOn(paymentIntegrationService.getState(), 'getShippingAddress').mockReturnValue(
            getEUShippingAddress(),
        );

        jest.spyOn(paymentIntegrationService, 'initializePayment').mockImplementation(jest.fn());

        jest.spyOn(scriptLoader, 'load').mockImplementation(() => Promise.resolve(klarnaPayments));

        jest.spyOn(klarnav2TokenUpdater, 'updateClientToken').mockResolvedValue(
            getResponse(getKlarna()),
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getCheckoutOrThrow').mockReturnValue(
            checkoutMock,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
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

        afterEach(() => {
            jest.clearAllMocks();
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

        it('throws InvalidArgumentError when gateway is not provided', async () => {
            const rejectedSpy = jest.fn();

            await strategy
                .initialize({
                    methodId: paymentMethod.id,
                    klarnav2: { container: '#container', onLoad },
                })
                .catch(rejectedSpy);

            expect(rejectedSpy).toHaveBeenCalledWith(
                new InvalidArgumentError(
                    'Unable to proceed because "payload.payment.gatewayId" argument is not provided.',
                ),
            );
        });

        it('loads script when initializing strategy', () => {
            expect(scriptLoader.load).toHaveBeenCalledTimes(1);
        });

        it('updateClientToken fails', async () => {
            const rejectedSpy = jest.fn();

            jest.spyOn(klarnav2TokenUpdater, 'updateClientToken').mockRejectedValue({});

            await strategy
                .initialize({
                    methodId: paymentMethod.id,
                    gatewayId: paymentMethod.gateway,
                    klarnav2: { container: '#container', onLoad },
                })
                .catch(rejectedSpy);

            expect(rejectedSpy).toHaveBeenCalledWith(
                new MissingDataError(MissingDataErrorType.MissingPaymentMethod),
            );
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

        it('authorizes against klarnav2', async () => {
            const loadCheckoutMock = jest.spyOn(paymentIntegrationService, 'loadCheckout');

            loadCheckoutMock.mockImplementation(jest.fn());

            await strategy.execute(payload);

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

        it('executes with no payment argument', async () => {
            try {
                await strategy.execute({ ...payload, payment: undefined });
            } catch (error) {
                expect(error).toMatchObject(
                    new InvalidArgumentError(
                        'Unable to proceed because "payload.payment" argument is not provided.',
                    ),
                );
            }
        });

        it('executes with no gateway argument', async () => {
            try {
                await strategy.execute({
                    ...payload,
                    payment: {
                        methodId: '',
                        ...payload.payment,
                        gatewayId: '',
                    },
                });
            } catch (error) {
                expect(error).toMatchObject(
                    new InvalidArgumentError(
                        'Unable to proceed because "payload.payment.gatewayId" argument is not provided.',
                    ),
                );
            }
        });

        it('loads widget in EU', async () => {
            const euBillingAddress = { data: getEUBillingAddress(), errors: {}, statuses: {} };

            strategy = new KlarnaV2PaymentStrategy(
                paymentIntegrationService,
                scriptLoader,
                klarnav2TokenUpdater,
            );
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getBillingAddressOrThrow',
            ).mockReturnValue(euBillingAddress.data);

            jest.spyOn(paymentIntegrationService.getState(), 'getShippingAddress').mockReturnValue(
                getAddress(),
            );

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
                klarnav2: { container: '#container' },
            });
            await strategy.execute(payload);

            expect(klarnaPayments.authorize).toHaveBeenCalledWith(
                { payment_method_category: paymentMethod.id },
                getKlarnaV2UpdateSessionParamsPhone(),
                expect.any(Function),
            );
        });

        it('loads widget in OC', async () => {
            const ocBillingAddress = { data: getOCBillingAddress(), errors: {}, statuses: {} };

            strategy = new KlarnaV2PaymentStrategy(
                paymentIntegrationService,
                scriptLoader,
                klarnav2TokenUpdater,
            );
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getBillingAddressOrThrow',
            ).mockReturnValue(ocBillingAddress.data);

            jest.spyOn(paymentIntegrationService.getState(), 'getShippingAddress').mockReturnValue(
                getAddress(),
            );

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
                klarnav2: { container: '#container' },
            });
            await strategy.execute(payload);

            expect(klarnaPayments.authorize).toHaveBeenCalledWith(
                { payment_method_category: paymentMethod.id },
                getKlarnaV2UpdateSessionParamsForOC(),
                expect.any(Function),
            );
        });

        it('loads widget in EU with no phone', async () => {
            const euBillingAddressWithNoPhone = {
                data: getEUBillingAddressWithNoPhone(),
                errors: {},
                statuses: {},
            };

            strategy = new KlarnaV2PaymentStrategy(
                paymentIntegrationService,
                scriptLoader,
                klarnav2TokenUpdater,
            );

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getBillingAddressOrThrow',
            ).mockReturnValue(euBillingAddressWithNoPhone.data);

            jest.spyOn(paymentIntegrationService.getState(), 'getShippingAddress').mockReturnValue(
                getAddress(),
            );

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
                klarnav2: { container: '#container' },
            });

            await strategy.execute(payload);

            expect(klarnaPayments.authorize).toHaveBeenCalledWith(
                { payment_method_category: paymentMethod.id },
                getKlarnaV2UpdateSessionParams(),
                expect.any(Function),
            );
        });

        // TODO: CHECKOUT-7766
        it('throws error if required data is not loaded', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getBillingAddressOrThrow',
            ).mockImplementation(() => {
                throw new MissingDataError(MissingDataErrorType.MissingBillingAddress);
            });

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
                klarnav2: { container: '#container' },
            });

            await expect(strategy.execute(payload)).rejects.toThrow(MissingDataError);
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

        describe('when the billing address is from an invalid country', () => {
            beforeEach(() => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getBillingAddressOrThrow',
                ).mockReturnValue({
                    ...getEUBillingAddress(),
                    countryCode: 'zzz',
                });
            });

            it('authorize gets called without session data', async () => {
                await strategy.execute(payload);

                expect(klarnaPayments.authorize).toHaveBeenCalledWith(
                    { payment_method_category: paymentMethod.id },
                    {},
                    expect.any(Function),
                );
            });
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

                expect(paymentIntegrationService.submitOrder).not.toHaveBeenCalled();
                expect(paymentIntegrationService.initializePayment).not.toHaveBeenCalled();
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

                expect(paymentIntegrationService.submitOrder).not.toHaveBeenCalled();
                expect(paymentIntegrationService.initializePayment).not.toHaveBeenCalled();
            });
        });
    });

    describe('when klarnav2 initialization fails', () => {
        beforeEach(() => {
            scriptLoader.load = jest.fn().mockResolvedValue(undefined);
        });

        it('rejects the payment execution with invalid payment error', async () => {
            const rejectedInitialization = jest.fn();
            const rejectedExecute = jest.fn();

            await strategy
                .initialize({
                    methodId: paymentMethod.id,
                    gatewayId: paymentMethod.gateway,
                    klarnav2: { container: '#container' },
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

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            try {
                await strategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });
    });

    describe('#deinitialize()', () => {
        const unsubscribe = jest.fn();

        beforeEach(async () => {
            jest.spyOn(paymentIntegrationService, 'subscribe').mockReturnValue(unsubscribe);
            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
                klarnav2: { container: '#container' },
            });
        });

        it('deinitializes and unsubscribes klarnav2 payment strategy', async () => {
            await strategy.deinitialize();

            expect(unsubscribe).toHaveBeenCalledTimes(1);
        });
    });
});
