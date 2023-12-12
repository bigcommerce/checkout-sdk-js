import {
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BlueSnapDirectSepaPaymentStrategy from './bluesnap-direct-sepa-payment-strategy';

describe('BlueSnapDirectCreditCardPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: BlueSnapDirectSepaPaymentStrategy;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        strategy = new BlueSnapDirectSepaPaymentStrategy(paymentIntegrationService);
    });

    describe('#initialize()', () => {
        it('initializes the strategy successfully', async () => {
            const initialize = strategy.initialize();

            await expect(initialize).resolves.toBeUndefined();
        });
    });

    describe('#execute()', () => {
        let payload: OrderRequestBody;

        beforeEach(async () => {
            payload = {
                payment: {
                    gatewayId: 'bluesnapdirect',
                    methodId: 'ideal',
                    paymentData: {
                        iban: '223344556',
                        firstName: 'John',
                        lastName: 'Smith',
                        shopperPermission: true,
                    },
                },
            };

            await strategy.initialize();
        });

        afterEach(() => {
            (paymentIntegrationService.submitOrder as jest.Mock).mockClear();
            (paymentIntegrationService.submitPayment as jest.Mock).mockClear();
        });

        it('executes the strategy successfully', async () => {
            const execute = strategy.execute(payload);

            await expect(execute).resolves.toBeUndefined();
        });

        it('should submit the order', async () => {
            await strategy.execute(payload);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
        });

        it('should submit the payment', async () => {
            const expectedPayment = {
                gatewayId: 'bluesnapdirect',
                methodId: 'ideal',
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

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        describe('should fail if...', () => {
            test('payload.payment is not en Sepa instrument', async () => {
                const execute = () => strategy.execute({ ...payload, payment: undefined });

                await expect(execute()).rejects.toThrow(PaymentArgumentInvalidError);
                expect(paymentIntegrationService.submitOrder).not.toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalled();
            });
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            const finalize = strategy.finalize();

            await expect(finalize).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes the strategy successfully', async () => {
            const deinitialize = strategy.deinitialize();

            await expect(deinitialize).resolves.toBeUndefined();
        });
    });
});
