import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';

import PayPalCommerceVenmoButtonStrategy from './paypal-commerce-venmo-button-strategy';

const createPayPalCommerceVenmoButtonStrategy: CheckoutButtonStrategyFactory<
    PayPalCommerceVenmoButtonStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceVenmoButtonStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createPayPalCommerceVenmoButtonStrategy, [
    { id: 'paypalcommercevenmo' },
]);
