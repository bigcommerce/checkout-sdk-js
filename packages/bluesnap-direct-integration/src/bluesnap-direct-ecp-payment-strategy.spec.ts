import {
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BlueSnapDirectEcpPaymentStrategy from './bluesnap-direct-ecp-payment-strategy';

describe('BlueSnapDirectCreditCardPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: BlueSnapDirectEcpPaymentStrategy;

    beforeEach(() => {
        paymentIntegrationService =
            new PaymentIntegrationServiceMock() as PaymentIntegrationService;

        strategy = new BlueSnapDirectEcpPaymentStrategy(paymentIntegrationService);
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
                    methodId: 'ecp',
                    paymentData: {
                        accountNumber: '223344556',
                        accountType: 'CONSUMER_CHECKING',
                        shopperPermission: true,
                        routingNumber: '998877665',
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

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        describe('should fail if...', () => {
            test('payload.payment is not en ECP instrument', async () => {
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
