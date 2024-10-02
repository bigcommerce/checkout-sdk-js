import {
    OrderFinalizationNotRequiredError,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getErrorPaymentResponseBody,
    getOrderRequestBody,
    getResponse,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BlueSnapDirectAPMPaymentStrategy from './bluesnap-direct-apm-payment-strategy';

describe('BlueSnapDirectAPMPaymentStrategy', () => {
    let strategy: BlueSnapDirectAPMPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        strategy = new BlueSnapDirectAPMPaymentStrategy(paymentIntegrationService);
    });

    describe('#execute()', () => {
        afterEach(() => {
            (paymentIntegrationService.submitOrder as jest.Mock).mockClear();
            (paymentIntegrationService.submitPayment as jest.Mock).mockClear();
        });

        it('throws error when payment data is empty', async () => {
            await strategy.initialize();

            await expect(strategy.execute({})).rejects.toThrow(PaymentArgumentInvalidError);
        });

        it('should submit stored instrument payment', async () => {
            await strategy.initialize();

            const payload = {
                payment: {
                    gatewayId: 'bluesnapdirect',
                    methodId: 'ecp',
                    paymentData: {
                        instrumentId: '223344556',
                        shouldSetAsDefaultInstrument: false,
                    },
                },
            };

            const expectedPayment = {
                gatewayId: 'bluesnapdirect',
                methodId: 'ecp',
                paymentData: {
                    instrumentId: '223344556',
                    shouldSetAsDefaultInstrument: false,
                },
            };

            await strategy.execute(payload);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        it('should submit the ECP payment', async () => {
            await strategy.initialize();

            const accountType = 'CONSUMER_CHECKING' as const;
            const payload = {
                payment: {
                    gatewayId: 'bluesnapdirect',
                    methodId: 'ecp',
                    paymentData: {
                        accountNumber: '223344556',
                        accountType,
                        shopperPermission: true,
                        routingNumber: '998877665',
                    },
                },
            };

            const expectedPayment = {
                gatewayId: 'bluesnapdirect',
                methodId: 'ecp',
                paymentData: {
                    formattedPayload: {
                        ecp: {
                            account_number: '223344556',
                            account_type: 'CONSUMER_CHECKING',
                            routing_number: '998877665',
                            shopper_permission: true,
                        },
                    },
                },
            };

            await strategy.execute(payload);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        it('should submit the SEPA payment', async () => {
            await strategy.initialize();

            const payload = {
                payment: {
                    gatewayId: 'bluesnapdirect',
                    methodId: 'sepa_direct_debit',
                    paymentData: {
                        iban: '223344556',
                        firstName: 'John',
                        lastName: 'Smith',
                        shopperPermission: true,
                    },
                },
            };

            const expectedPayment = {
                gatewayId: 'bluesnapdirect',
                methodId: 'sepa_direct_debit',
                paymentData: {
                    formattedPayload: {
                        sepa_direct_debit: {
                            iban: '223344556',
                            first_name: 'John',
                            last_name: 'Smith',
                            shopper_permission: true,
                        },
                    },
                },
            };

            await strategy.execute(payload);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        it('submits order without payment data for offsite payment instruments', async () => {
            const payload = {
                payment: {
                    gatewayId: 'bluesnapdirect',
                    methodId: 'moneybookers',
                    paymentData: {
                        terms: false,
                        shouldCreateAccount: true,
                        shouldSaveInstrument: false,
                    },
                },
            };

            await strategy.initialize();

            await strategy.execute(payload);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: payload.payment.methodId,
            });
        });

        it('rejects payment when error is different to additional_action_required', async () => {
            await strategy.initialize();

            const error = new RequestError(getResponse(getErrorPaymentResponseBody()));

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                Promise.reject(error),
            );

            await expect(strategy.execute(getOrderRequestBody())).rejects.toThrow(error);
        });

        it('redirects to bluesnapdirect if additional action is required and provider_data is not empty', async () => {
            const payload = {
                payment: {
                    gatewayId: 'bluesnapdirect',
                    methodId: 'moneybookers',
                    paymentData: {
                        terms: false,
                        shouldCreateAccount: true,
                        shouldSaveInstrument: false,
                    },
                },
            };

            Object.defineProperty(window, 'location', {
                value: {
                    replace: jest.fn(),
                },
            });
            await strategy.initialize();

            const redirect_url = 'https://sandbox.bluesnap.com/buynow/checkout?enc=test';
            const error = new RequestError(
                getResponse({
                    additional_action_required: {
                        data: {
                            redirect_url,
                        },
                        type: 'offsite_redirect',
                    },
                    status: 'additional_action_required',
                    provider_data: JSON.stringify({
                        merchantid: '123',
                    }),
                }),
            );

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                Promise.reject(error),
            );

            void strategy.execute(payload);
            await new Promise((resolve) => process.nextTick(resolve));

            expect(window.location.replace).toHaveBeenCalledWith(`${redirect_url}&merchantid=123`);
        });

        it('redirects to bluesnapdirect if additional action is required for Ideal', async () => {
            const payload = {
                payment: {
                    gatewayId: 'bluesnapdirect',
                    methodId: 'ideal',
                    paymentData: {
                        bic: '223344556',
                    },
                },
            };

            Object.defineProperty(window, 'location', {
                value: {
                    replace: jest.fn(),
                },
            });
            await strategy.initialize();

            const redirect_url = 'https://sandbox.bluesnap.com/buynow/checkout?enc=test';
            const error = new RequestError(
                getResponse({
                    additional_action_required: {
                        data: {
                            redirect_url,
                        },
                        type: 'offsite_redirect',
                    },
                    status: 'additional_action_required',
                }),
            );

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                Promise.reject(error),
            );

            void strategy.execute(payload);
            await new Promise((resolve) => process.nextTick(resolve));

            expect(window.location.replace).toHaveBeenCalledWith(redirect_url);
        });

        it('redirects to bluesnapdirect if additional action is required for Pay by Bank', async () => {
            const payload = {
                payment: {
                    gatewayId: 'bluesnapdirect',
                    methodId: 'pay_by_bank',
                    paymentData: {
                        iban: 'DE12345678901234567890',
                    },
                },
            };

            Object.defineProperty(window, 'location', {
                value: {
                    replace: jest.fn(),
                },
            });
            await strategy.initialize();

            const redirect_url = 'https://sandbox.bluesnap.com/buynow/checkout?enc=test';
            const error = new RequestError(
                getResponse({
                    additional_action_required: {
                        data: {
                            redirect_url,
                        },
                        type: 'offsite_redirect',
                    },
                    status: 'additional_action_required',
                }),
            );

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                Promise.reject(error),
            );

            void strategy.execute(payload);
            await new Promise((resolve) => process.nextTick(resolve));

            expect(window.location.replace).toHaveBeenCalledWith(redirect_url);
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
