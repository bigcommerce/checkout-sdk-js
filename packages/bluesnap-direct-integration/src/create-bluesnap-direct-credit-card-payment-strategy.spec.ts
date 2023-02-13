import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BlueSnapDirectCreditCardPaymentStrategy from './bluesnap-direct-credit-card-payment-strategy';
import createBlueSnapDirectCreditCardPaymentStrategy from './create-bluesnap-direct-credit-card-payment-strategy';

describe('createBlueSnapDirectCreditCardPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService =
            new PaymentIntegrationServiceMock() as PaymentIntegrationService;
    });

    it('instantiates bluesnapdirect cc payment strategy', () => {
        const strategy = createBlueSnapDirectCreditCardPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BlueSnapDirectCreditCardPaymentStrategy);
    });
});
