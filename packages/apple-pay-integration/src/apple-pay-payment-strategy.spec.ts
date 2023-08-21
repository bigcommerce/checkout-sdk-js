import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';

import {
    BraintreeIntegrationService,
    BraintreeScriptLoader,
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
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import ApplePayPaymentStrategy from './apple-pay-payment-strategy';
import ApplePaySessionFactory from './apple-pay-session-factory';
import { getApplePay } from './mocks/apple-pay-method.mock';
import { MockApplePaySession } from './mocks/apple-pay-payment.mock';
import { ApplePayGatewayType } from './apple-pay';

describe('ApplePayPaymentStrategy', () => {
    let requestSender: RequestSender;
    let applePayFactory: ApplePaySessionFactory;
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: ApplePayPaymentStrategy;
    let paymentMethod: PaymentMethod;
    let applePaySession: MockApplePaySession;
    let braintreeIntegrationService: BraintreeIntegrationService;

    beforeEach(() => {
        applePaySession = new MockApplePaySession();

        Object.defineProperty(window, 'ApplePaySession', {
            writable: true,
            value: applePaySession,
        });

        paymentIntegrationService = new PaymentIntegrationServiceMock();
        braintreeIntegrationService = new BraintreeIntegrationService(
            new BraintreeScriptLoader(getScriptLoader(), window),
            window,
        );

        requestSender = createRequestSender();
        applePayFactory = new ApplePaySessionFactory();
        paymentMethod = getApplePay();

        jest.spyOn(requestSender, 'post').mockReturnValue(true);

        jest.spyOn(applePayFactory, 'create').mockReturnValue(applePaySession);

        strategy = new ApplePayPaymentStrategy(
            requestSender,
            paymentIntegrationService,
            applePayFactory,
            braintreeIntegrationService,
        );
    });

    describe('#initialize()', () => {
        it('throws invalid argument error if no method id', async () => {
            await expect(strategy.initialize()).rejects.toBeInstanceOf(InvalidArgumentError);
        });

        it('initializes the strategy successfully', async () => {
            await strategy.initialize({ methodId: 'applepay' });

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
        });
    });

    describe('#execute()', () => {
        beforeEach(() => {
            jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockReturnValue(
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

        describe('braintree gateway', () => {
            beforeEach(() => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockImplementation((methodId) => {
                    if (methodId === 'applepay') {
                        const applePayPaymentMethod = getApplePay();

                        applePayPaymentMethod.initializationData.gateway = 'braintree';

                        return applePayPaymentMethod;
                    }

                    if (methodId === 'braintree') {
                        return getBraintree();
                    }

                    return {};
                });

                jest.spyOn(braintreeIntegrationService, 'getClient').mockImplementation(
                    () => 'token',
                );

                jest.spyOn(braintreeIntegrationService, 'getDataCollector').mockImplementation(() =>
                    getDataCollectorMock(),
                );
            });

            it('submits payment with deviceSessionId', async () => {
                await strategy.initialize({ methodId: 'applepay' });

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

                expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(
                    ApplePayGatewayType.BRAINTREE,
                );

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        paymentData: expect.objectContaining({
                            deviceSessionId: getDeviceDataMock(),
                        }),
                    }),
                );
            });
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
