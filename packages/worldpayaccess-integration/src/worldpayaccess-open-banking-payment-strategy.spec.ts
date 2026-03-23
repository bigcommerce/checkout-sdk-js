import {
    OrderFinalizationNotRequiredError,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getErrorPaymentResponseBody,
    getResponse,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';

import WorldpayAccessOpenBankingPaymentStrategy from './worldpayaccess-open-banking-payment-strategy';

describe('WorldpayAccessOpenBankingPaymentStrategy', () => {
    let strategy: WorldpayAccessOpenBankingPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        strategy = new WorldpayAccessOpenBankingPaymentStrategy(paymentIntegrationService);
    });

    describe('#execute()', () => {
        afterEach(() => {
            (paymentIntegrationService.submitOrder as jest.Mock).mockClear();
            (paymentIntegrationService.submitPayment as jest.Mock).mockClear();
        });

        it('throws error when payment is missing', async () => {
            await strategy.initialize();

            await expect(strategy.execute({})).rejects.toThrow(PaymentArgumentInvalidError);
        });

        it('submits order and payment with open_banking payload', async () => {
            await strategy.initialize();

            const payload = {
                payment: {
                    methodId: 'open_banking',
                    gatewayId: 'worldpayaccess',
                    paymentData: {
                        open_banking: {
                            bank_code: '1345',
                        },
                    },
                },
            };

            const expectedPayment = {
                methodId: 'open_banking',
                gatewayId: 'worldpayaccess',
                paymentData: {
                    formattedPayload: {
                        open_banking: {
                            bank_code: '1345',
                        },
                    },
                },
            };

            await strategy.execute(payload as OrderRequestBody);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                expectedPayment,
            );
        });

        it('uses worldpayaccess as gatewayId when gatewayId is omitted', async () => {
            await strategy.initialize();

            const payload = {
                payment: {
                    methodId: 'open_banking',
                    paymentData: {
                        open_banking: {
                            bank_code: '9999',
                        },
                    },
                },
            };

            await strategy.execute(payload as OrderRequestBody);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    gatewayId: 'worldpayaccess',
                    paymentData: { formattedPayload: { open_banking: { bank_code: '9999' } } },
                }),
            );
        });

        it('rejects when error is not additional_action_required', async () => {
            await strategy.initialize();

            const payload = {
                payment: {
                    methodId: 'open_banking',
                    gatewayId: 'worldpayaccess',
                    paymentData: {
                        open_banking: { bank_code: '1345' },
                    },
                },
            };

            const error = new RequestError(getResponse(getErrorPaymentResponseBody()));

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                Promise.reject(error),
            );

            await expect(strategy.execute(payload as OrderRequestBody)).rejects.toThrow(
                error,
            );
        });

        it('redirects when additional_action_required with redirect_url is returned', async () => {
            const payload = {
                payment: {
                    methodId: 'open_banking',
                    gatewayId: 'worldpayaccess',
                    paymentData: {
                        open_banking: { bank_code: '1345' },
                    },
                },
            };

            Object.defineProperty(window, 'location', {
                value: {
                    replace: jest.fn(),
                },
            });

            await strategy.initialize();

            const redirectUrl = 'https://bank.example.com/authorize';
            const error = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    status: 'additional_action_required',
                    additional_action_required: {
                        data: {
                            redirect_url: redirectUrl,
                        },
                    },
                }),
            );

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                Promise.reject(error),
            );

            void strategy.execute(payload as OrderRequestBody);
            await new Promise((resolve) => process.nextTick(resolve));

            expect(window.location.replace).toHaveBeenCalledWith(redirectUrl);
        });
    });

    describe('#initialize()', () => {
        it('initializes the strategy successfully', async () => {
            const result = await strategy.initialize();

            expect(result).toBeUndefined();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(
                OrderFinalizationNotRequiredError,
            );
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            const result = await strategy.deinitialize();

            expect(result).toBeUndefined();
        });
    });
});
