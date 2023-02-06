import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createPayPalCommerceVenmoButtonStrategy from './create-paypal-commerce-venmo-button-strategy';
import PayPalCommerceButtonStrategy from './paypal-commerce-venmo-button-strategy';

describe('createPayPalCommerceVenmoButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal commerce venmo button strategy', () => {
        const strategy = createPayPalCommerceVenmoButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(PayPalCommerceButtonStrategy);
    });
});
