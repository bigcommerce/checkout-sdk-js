import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';

import PayPalCommerceVenmoCustomerStrategy from './paypal-commerce-venmo-customer-strategy';

const createPayPalCommerceVenmoCustomerStrategy: CustomerStrategyFactory<
    PayPalCommerceVenmoCustomerStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceVenmoCustomerStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createPayPalCommerceVenmoCustomerStrategy, [
    { id: 'paypalcommercevenmo' },
]);
