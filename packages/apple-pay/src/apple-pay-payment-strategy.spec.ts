import { getOrderRequestBody, InvalidArgumentError, OrderFinalizationNotRequiredError, PaymentArgumentInvalidError, PaymentIntegrationServiceMock, PaymentIntegrationService, PaymentMethod, PaymentMethodCancelledError } from "@bigcommerce/checkout-sdk/payment-integration";

import {
    createRequestSender,
    RequestSender,
} from "@bigcommerce/request-sender"
import { merge } from "lodash";
import ApplePayPaymentStrategy from "./apple-pay-payment-strategy";
import ApplePaySessionFactory from "./apple-pay-session-factory";
import { getApplePay } from "./mocks/apple-pay-method.mock";
import { MockApplePaySession } from "./mocks/apple-pay-payment.mock";

describe("ApplePayPaymentStrategy", () => {
    let requestSender: RequestSender;
    let applePayFactory: ApplePaySessionFactory;
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: ApplePayPaymentStrategy;
    let paymentMethod: PaymentMethod;

    beforeEach(() => {
        Object.defineProperty(window, "ApplePaySession", {
            writable: true,
            value: MockApplePaySession,
        });

        paymentIntegrationService = new PaymentIntegrationServiceMock();

        requestSender = createRequestSender();
        applePayFactory = new ApplePaySessionFactory();
        paymentMethod = getApplePay();

        jest.spyOn(requestSender, 'post')
            .mockReturnValue(true);

        strategy = new ApplePayPaymentStrategy(
            requestSender,
            paymentIntegrationService,
            applePayFactory
        );
    });

    describe("#initialize()", () => {
        it("throws invalid argument error if no method id", async () => {
            await expect(strategy.initialize()).rejects.toBeInstanceOf(
                InvalidArgumentError
            );
        });

        it('initializes the strategy successfully', async () => {
            await strategy.initialize({ methodId: 'applepay' });
            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
        });
    });

    describe('#execute()', () => {
        beforeEach(() => {
            jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(getApplePay());
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

            await new Promise(resolve => process.nextTick(resolve));
            await strategy.applePaySession.onvalidatemerchant(validateEvent);

            expect(strategy.applePaySession.begin).toHaveBeenCalled();
            expect(requestSender.post).toHaveBeenCalled();
        });

        it('throws error if merchant validation fails', async () => {
            jest.spyOn(requestSender, 'post')
                .mockRejectedValue(false);

            const payload = merge({}, getOrderRequestBody(), {
                payment: { methodId: paymentMethod.id },
            });
            strategy.execute(payload);

            await new Promise(resolve => process.nextTick(resolve));

            const validateEvent = {
                validationURL: 'test',
            } as ApplePayJS.ApplePayValidateMerchantEvent;

            try {
                await strategy.applePaySession.onvalidatemerchant(validateEvent);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        it('throws error when Apple Pay payment sheet is cancelled', async () => {
            jest.spyOn(requestSender, 'post')
                .mockRejectedValue(false);

            const payload = merge({}, getOrderRequestBody(), {
                payment: { methodId: paymentMethod.id },
            });
            const promise = strategy.execute(payload);
            await new Promise(resolve => process.nextTick(resolve));
            strategy.applePaySession.oncancel({} as ApplePayJS.Event);

            expect(promise).rejects.toThrow(new PaymentMethodCancelledError('Continue with applepay'));
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
            await new Promise(resolve => process.nextTick(resolve));
            await strategy.applePaySession.onpaymentauthorized(authEvent);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
            expect(strategy.applePaySession.completePayment).toHaveBeenCalled();
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
            await expect(JSON.stringify(result)).toEqual(JSON.stringify(paymentIntegrationService.getState()));
        });
    });
});
