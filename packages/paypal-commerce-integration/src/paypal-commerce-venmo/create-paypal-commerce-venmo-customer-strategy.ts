import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalIntegrationService,
    PaypalButtonCreationService,
} from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceVenmoCustomerStrategy from './paypal-commerce-venmo-customer-strategy';

const createPayPalCommerceVenmoCustomerStrategy: CustomerStrategyFactory<
    PayPalCommerceVenmoCustomerStrategy
> = (paymentIntegrationService) => {
    const paypalIntegrationService = createPayPalIntegrationService(paymentIntegrationService);
    const buttonCreationService = new PaypalButtonCreationService(
        paymentIntegrationService,
        paypalIntegrationService,
    );

    return new PayPalCommerceVenmoCustomerStrategy(
        paymentIntegrationService,
        paypalIntegrationService,
        buttonCreationService,
    );
};

export default toResolvableModule(createPayPalCommerceVenmoCustomerStrategy, [
    { id: 'paypalcommercevenmo' },
]);
