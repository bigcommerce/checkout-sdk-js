import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BlueSnapDirectCreditCardPaymentStrategy from './bluesnap-direct-credit-card-payment-strategy';

describe('BlueSnapDirectCreditCardPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: BlueSnapDirectCreditCardPaymentStrategy;

    beforeEach(() => {
        paymentIntegrationService =
            new PaymentIntegrationServiceMock() as PaymentIntegrationService;

        strategy = new BlueSnapDirectCreditCardPaymentStrategy(paymentIntegrationService);
    });

    describe('#initialize()', () => {
        it('initializes the strategy successfully', async () => {
            await expect(strategy.initialize()).resolves.toBeUndefined();
        });
    });

    describe('#execute()', () => {
        it('executes the strategy successfully', async () => {
            await expect(strategy.execute()).resolves.toBeUndefined();
        });
    });

    describe('#finalize()', () => {
        it('finalizes the strategy successfully', async () => {
            await expect(strategy.finalize()).resolves.toBeUndefined();
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes the strategy successfully', async () => {
            await expect(strategy.deinitialize()).resolves.toBeUndefined();
        });
    });
});
