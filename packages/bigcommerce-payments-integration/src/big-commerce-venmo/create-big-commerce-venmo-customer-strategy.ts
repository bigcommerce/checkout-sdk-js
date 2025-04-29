import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createBigCommerceIntegrationService from '../create-big-commerce-integration-service';

import BigCommerceVenmoCustomerStrategy from './big-commerce-venmo-customer-strategy';

const createBigCommerceVenmoCustomerStrategy: CustomerStrategyFactory<
    BigCommerceVenmoCustomerStrategy
> = (paymentIntegrationService) =>
    new BigCommerceVenmoCustomerStrategy(
        paymentIntegrationService,
        createBigCommerceIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createBigCommerceVenmoCustomerStrategy, [
    { id: 'bigcommercevenmo' },
]);
