import {
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getOrderRequestBody,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsInvoicesPaymentStrategy from './bigcommerce-payments-invoices-payment-strategy';

describe('BigCommercePaymentsInvoicesPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: BigCommercePaymentsInvoicesPaymentStrategy;

    const defaultMethodId = 'bigcommerce_payments_invoices';

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        strategy = new BigCommercePaymentsInvoicesPaymentStrategy(paymentIntegrationService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('creates an instance of the BigCommercePayments Invoices payment strategy', () => {
        expect(strategy).toBeInstanceOf(BigCommercePaymentsInvoicesPaymentStrategy);
    });

    describe('#initialize()', () => {
        it('initializes the strategy successfully', async () => {
            const result = await strategy.initialize();

            expect(result).toBeUndefined();
        });
    });

    describe('#execute()', () => {
        it('throws an error if payload.payment is not provided', async () => {
            try {
                await strategy.execute({ ...getOrderRequestBody(), payment: undefined });
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
            }
        });

        it('throws an error if payload.payment.methodId is not provided', async () => {
            const payload = {
                ...getOrderRequestBody(),
                payment: { methodId: undefined },
            } as unknown as OrderRequestBody;

            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
            }
        });

        it('submits order with provided data', async () => {
            const payload = {
                ...getOrderRequestBody(),
                payment: { methodId: defaultMethodId },
            };
            const { payment, ...order } = payload;

            await strategy.execute(payload);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(order, undefined);
        });

        it('submits payment with formatted payload', async () => {
            const payload = {
                ...getOrderRequestBody(),
                payment: { methodId: defaultMethodId },
            };

            await strategy.execute(payload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: defaultMethodId,
                paymentData: {
                    formattedPayload: {},
                },
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
