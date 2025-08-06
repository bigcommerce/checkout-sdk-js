import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';

import {
    BraintreeScriptLoader,
    BraintreeSdk,
    BraintreeSDKVersionManager,
    getBraintree,
    getDataCollectorMock,
    getDeviceDataMock,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    InvalidArgumentError,
    OrderFinalizationNotRequiredError,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodCancelledError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getOrderRequestBody,
    getResponse,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import ApplePayPaymentStrategy from './apple-pay-payment-strategy';
import ApplePayScriptLoader from './apple-pay-script-loader';
import ApplePaySessionFactory from './apple-pay-session-factory';
import { getApplePay } from './mocks/apple-pay-method.mock';
import { MockApplePaySession } from './mocks/apple-pay-payment.mock';

describe('ApplePayPaymentStrategy', () => {
    let requestSender: RequestSender;
    let applePayFactory: ApplePaySessionFactory;
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: ApplePayPaymentStrategy;
    let paymentMethod: PaymentMethod;
    let applePaySession: MockApplePaySession;
    let braintreeSdk: BraintreeSdk;
    let braintreeSDKVersionManager: BraintreeSDKVersionManager;
    let applePayScriptLoader: ApplePayScriptLoader;

    beforeEach(() => {
        applePaySession = new MockApplePaySession();

        Object.defineProperty(window, 'ApplePaySession', {
            writable: true,
            value: applePaySession,
        });

        braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        braintreeSdk = new BraintreeSdk(
            new BraintreeScriptLoader(getScriptLoader(), window, braintreeSDKVersionManager),
        );

        requestSender = createRequestSender();
        applePayFactory = new ApplePaySessionFactory();
        paymentMethod = getApplePay();
        applePayScriptLoader = new ApplePayScriptLoader(getScriptLoader());

        jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(getResponse({})));

        jest.spyOn(applePayFactory, 'create').mockReturnValue(applePaySession);

        jest.spyOn(applePayScriptLoader, 'loadSdk').mockReturnValue(Promise.resolve());

        strategy = new ApplePayPaymentStrategy(
            requestSender,
            paymentIntegrationService,
            applePayFactory,
            braintreeSdk,
            applePayScriptLoader,
        );
    });

    describe('#initialize()', () => {
        beforeEach(() => {
            jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockResolvedValue(
                paymentIntegrationService.getState(),
            );

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(getApplePay());
        });

        it('load Apple Pay SDK', async () => {
            await strategy.initialize({ methodId: 'applepay' });

            expect(applePayScriptLoader.loadSdk).toHaveBeenCalled();
        });

        it('throws invalid argument error if no method id', async () => {
            await expect(strategy.initialize()).rejects.toBeInstanceOf(InvalidArgumentError);
        });

        it('initializes the strategy successfully', async () => {
            await strategy.initialize({ methodId: 'applepay' });

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
        });

        it('initializes braintree sdk on apple pay strategy initialization', async () => {
            const applePayPaymentMethod = getApplePay();

            applePayPaymentMethod.initializationData.gateway = 'braintree';

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockImplementation(() => applePayPaymentMethod);

            jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethod').mockImplementation(
                () => getBraintree(),
            );

            jest.spyOn(braintreeSdk, 'initialize').mockImplementation(jest.fn());
            jest.spyOn(braintreeSdk, 'getDataCollectorOrThrow').mockImplementation(() =>
                Promise.resolve(getDataCollectorMock()),
            );

            await strategy.initialize({ methodId: 'applepay' });

            expect(braintreeSdk.initialize).toHaveBeenCalled();
        });
    });

    describe('#execute()', () => {
        beforeEach(() => {
            jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockResolvedValue(
                paymentIntegrationService.getState(),
            );

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(getApplePay());
        });

        it('throws error when payment data is empty', async () => {
            await expect(strategy.execute({})).rejects.toThrow(PaymentArgumentInvalidError);
        });

        it('validates merchant', async () => {
            const payload = merge({}, getOrderRequestBody(), {
                payment: { methodId: paymentMethod.id },
            });

            strategy.execute(payload);

            const validateEvent = {
                validationURL: 'test',
            } as ApplePayJS.ApplePayValidateMerchantEvent;

            await new Promise((resolve) => process.nextTick(resolve));
            await applePaySession.onvalidatemerchant(validateEvent);

            expect(applePaySession.begin).toHaveBeenCalled();
            expect(requestSender.post).toHaveBeenCalled();
        });

        it('throws error if merchant validation fails', async () => {
            jest.spyOn(requestSender, 'post').mockRejectedValue(false);

            const payload = merge({}, getOrderRequestBody(), {
                payment: { methodId: paymentMethod.id },
            });

            strategy.execute(payload);

            await new Promise((resolve) => process.nextTick(resolve));

            const validateEvent = {
                validationURL: 'test',
            } as ApplePayJS.ApplePayValidateMerchantEvent;

            try {
                await applePaySession.onvalidatemerchant(validateEvent);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        it('throws error when Apple Pay payment sheet is cancelled', async () => {
            jest.spyOn(requestSender, 'post').mockRejectedValue(false);

            const payload = merge({}, getOrderRequestBody(), {
                payment: { methodId: paymentMethod.id },
            });
            const promise = strategy.execute(payload);

            await new Promise((resolve) => process.nextTick(resolve));
            applePaySession.oncancel();

            expect(promise).rejects.toThrow(
                new PaymentMethodCancelledError('Continue with applepay'),
            );
        });

        it('submits payment when shopper authorises', async () => {
            const payload = merge({}, getOrderRequestBody(), {
                payment: { methodId: paymentMethod.id },
            });
            const authEvent = {
                payment: {
                    token: {
                        paymentData: {},
                        paymentMethod: {},
                        transactionIdentifier: {},
                    },
                },
            } as ApplePayJS.ApplePayPaymentAuthorizedEvent;

            strategy.execute(payload);
            await new Promise((resolve) => process.nextTick(resolve));
            await applePaySession.onpaymentauthorized(authEvent);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
            expect(applePaySession.completePayment).toHaveBeenCalled();
        });

        it('submits payment with provided braintree device data session', async () => {
            const braintreePaymentMethod = getBraintree();

            const applePayPaymentMethod = getApplePay();

            applePayPaymentMethod.initializationData.gateway = 'braintree';

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockImplementation(() => applePayPaymentMethod);

            jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethod').mockImplementation(
                () => braintreePaymentMethod,
            );

            jest.spyOn(braintreeSdk, 'initialize').mockImplementation(jest.fn());
            jest.spyOn(braintreeSdk, 'getDataCollectorOrThrow').mockImplementation(() =>
                Promise.resolve(getDataCollectorMock()),
            );

            const payload = merge({}, getOrderRequestBody(), {
                payment: { methodId: paymentMethod.id },
            });

            const authEvent = {
                payment: {
                    billingContact: {},
                    shippingContact: {},
                    token: {
                        paymentData: {},
                        paymentMethod: {},
                        transactionIdentifier: {},
                    },
                },
            } as ApplePayJS.ApplePayPaymentAuthorizedEvent;

            await strategy.initialize({ methodId: 'applepay' });
            await new Promise((resolve) => process.nextTick(resolve));

            strategy.execute(payload);
            await new Promise((resolve) => process.nextTick(resolve));
            await applePaySession.onpaymentauthorized(authEvent);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    paymentData: expect.objectContaining({
                        deviceSessionId: getDeviceDataMock(),
                    }),
                }),
            );
        });

        it('submits payment with braintree device data session as undefined when braintree sdk rejects with an error', async () => {
            const braintreePaymentMethod = getBraintree();

            const applePayPaymentMethod = getApplePay();

            applePayPaymentMethod.initializationData.gateway = 'braintree';

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockImplementation(() => applePayPaymentMethod);

            jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethod').mockImplementation(
                () => braintreePaymentMethod,
            );

            jest.spyOn(braintreeSdk, 'initialize').mockImplementation(jest.fn());
            jest.spyOn(braintreeSdk, 'getDataCollectorOrThrow').mockImplementation(() =>
                Promise.reject(new Error('Braintree SDK related error')),
            );

            const payload = merge({}, getOrderRequestBody(), {
                payment: { methodId: paymentMethod.id },
            });

            const authEvent = {
                payment: {
                    billingContact: {},
                    shippingContact: {},
                    token: {
                        paymentData: {},
                        paymentMethod: {},
                        transactionIdentifier: {},
                    },
                },
            } as ApplePayJS.ApplePayPaymentAuthorizedEvent;

            await strategy.initialize({ methodId: 'applepay' });
            await new Promise((resolve) => process.nextTick(resolve));

            strategy.execute(payload);
            await new Promise((resolve) => process.nextTick(resolve));
            await applePaySession.onpaymentauthorized(authEvent);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    paymentData: expect.objectContaining({
                        deviceSessionId: undefined,
                    }),
                }),
            );
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            const result = await strategy.deinitialize();

            expect(result).toBeUndefined();
        });
    });
});
