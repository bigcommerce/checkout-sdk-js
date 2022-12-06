import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { merge } from 'lodash';

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

describe('ApplePayPaymentStrategy', () => {
    let requestSender: RequestSender;
    let applePayFactory: ApplePaySessionFactory;
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: ApplePayPaymentStrategy;
    let paymentMethod: PaymentMethod;
    let applePaySession: MockApplePaySession;

    beforeEach(() => {
        applePaySession = new MockApplePaySession();

        Object.defineProperty(window, 'ApplePaySession', {
            writable: true,
            value: applePaySession,
        });

        paymentIntegrationService = new PaymentIntegrationServiceMock();

        requestSender = createRequestSender();
        applePayFactory = new ApplePaySessionFactory();
        paymentMethod = getApplePay();

        jest.spyOn(requestSender, 'post').mockReturnValue(true);

        jest.spyOn(applePayFactory, 'create').mockReturnValue(applePaySession);

        strategy = new ApplePayPaymentStrategy(
            requestSender,
            paymentIntegrationService,
            applePayFactory,
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
