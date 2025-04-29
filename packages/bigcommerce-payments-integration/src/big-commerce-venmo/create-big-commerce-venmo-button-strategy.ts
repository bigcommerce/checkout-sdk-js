import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createBigCommerceIntegrationService from '../create-big-commerce-integration-service';

import BigCommerceVenmoButtonStrategy from './big-commerce-venmo-button-strategy';

const createBigCommerceVenmoButtonStrategy: CheckoutButtonStrategyFactory<
    BigCommerceVenmoButtonStrategy
> = (paymentIntegrationService) =>
    new BigCommerceVenmoButtonStrategy(
        paymentIntegrationService,
        createBigCommerceIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createBigCommerceVenmoButtonStrategy, [
    { id: 'bigcommercevenmo' },
]);
