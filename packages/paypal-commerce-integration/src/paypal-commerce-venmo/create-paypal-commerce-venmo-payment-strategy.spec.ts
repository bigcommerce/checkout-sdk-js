import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createPayPalCommerceVenmoPaymentStrategy from './create-paypal-commerce-venmo-payment-strategy';
import PayPalCommerceVenmoPaymentStrategy from './paypal-commerce-venmo-payment-strategy';

describe('createPayPalCommerceVenmoPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal commerce venmo payment strategy', () => {
        const strategy = createPayPalCommerceVenmoPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(PayPalCommerceVenmoPaymentStrategy);
    });
});
