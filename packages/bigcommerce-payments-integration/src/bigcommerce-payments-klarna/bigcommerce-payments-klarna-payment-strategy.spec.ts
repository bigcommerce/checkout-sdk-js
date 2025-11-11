import {
    InvalidArgumentError,
    OrderFinalizationNotRequiredError,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsIntegrationService from '../bigcommerce-payments-integration-service';
import { getBigCommercePaymentsIntegrationServiceMock } from '../mocks';

import BigCommercePaymentsKlarnaPaymentInitializeOptions from './bigcomemrce-payments-klarna-payment-initialize-options';
import BigCommercePaymentsKlarnaPaymentStrategy from './bigcomemrce-payments-klarna-payment-strategy';

describe('BigCommercePaymentsKlarnaPaymentStrategy', () => {
    let strategy: BigCommercePaymentsKlarnaPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let originalLocation: Location;
    let bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService;

    const defaultMethodId = 'klarna';
    const defaultGatewayId = 'bigcommerce_payments';
    const klarnaOrderId = 'orderId123';

    const bigCommercePaymentsKlarnaOptions: BigCommercePaymentsKlarnaPaymentInitializeOptions = {
        onError: jest.fn(),
    };

    const initializationOptions: PaymentInitializeOptions = {
        methodId: defaultMethodId,
        gatewayId: defaultGatewayId,
        bigcommerce_payments_apms: bigCommercePaymentsKlarnaOptions,
    };

    beforeEach(() => {
        originalLocation = window.location;
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        bigCommercePaymentsIntegrationService = getBigCommercePaymentsIntegrationServiceMock();

        strategy = new BigCommercePaymentsKlarnaPaymentStrategy(
            paymentIntegrationService,
            bigCommercePaymentsIntegrationService,
        );

        jest.spyOn(paymentIntegrationService, 'submitPayment').mockResolvedValue(
            paymentIntegrationService.getState(),
        );

        jest.spyOn(bigCommercePaymentsIntegrationService, 'createOrder').mockResolvedValue(
            klarnaOrderId,
        );

        Object.defineProperty(window, 'location', {
            value: { replace: jest.fn() },
            writable: true,
        });
    });

    afterEach(() => {
        Object.defineProperty(window, 'location', {
            value: originalLocation,
            writable: true,
        });

        jest.clearAllMocks();
    });

    it('creates an instance of the BigCommercePayments Klarna payment strategy', () => {
        expect(strategy).toBeInstanceOf(BigCommercePaymentsKlarnaPaymentStrategy);
    });

    describe('#initialize()', () => {
        it('throws error if methodId is not provided', async () => {
            const options = {} as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error if gatewayId is not provided', async () => {
            const options = {
                methodId: defaultMethodId,
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });
    });

    describe('#execute()', () => {
        it('throws an error if payload.payment is not provided', async () => {
            try {
                await strategy.execute({});
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
            }
        });

        it('submits payment with provided data', async () => {
            const payload = {
                payment: {
                    methodId: defaultMethodId,
                    gatewayId: defaultGatewayId,
                },
            };

            await strategy.initialize(initializationOptions);

            await new Promise((resolve) => process.nextTick(resolve));

            await strategy.execute(payload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: defaultMethodId,
                gatewayId: defaultGatewayId,
                paymentData: {
                    formattedPayload: {
                        vault_payment_instrument: null,
                        set_as_default_stored_instrument: null,
                        device_info: null,
                        method_id: defaultMethodId,
                        paypal_account: {
                            order_id: klarnaOrderId,
                        },
                    },
                },
            });
        });

        it('calls onError callback for non-redirect errors', async () => {
            const error = new Error('Payment failed');
            const mockOnError = jest.fn();

            await strategy.initialize({
                ...initializationOptions,
                bigcommerce_payments_apms: { onError: mockOnError },
            });
            await new Promise((resolve) => process.nextTick(resolve));

            const payload = {
                payment: {
                    methodId: defaultMethodId,
                    gatewayId: defaultGatewayId,
                },
            };

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue(error);

            await expect(strategy.execute(payload)).rejects.toThrow('Payment failed');
            expect(mockOnError).toHaveBeenCalledWith(error);
        });

        it('handles redirect error by calling window.location.replace and rejecting', async () => {
            const redirectError = {
                body: {
                    additional_action_required: {
                        data: {
                            redirect_url: 'mocked_redirect_url',
                        },
                    },
                },
            };

            const payload = {
                payment: {
                    methodId: defaultMethodId,
                    gatewayId: defaultGatewayId,
                },
            };

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue(redirectError);

            await expect(strategy.execute(payload)).rejects.toBeUndefined();
            expect(window.location.replace).toHaveBeenCalledWith('mocked_redirect_url');
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            const result = await strategy.deinitialize();

            expect(result).toBeUndefined();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });
});
