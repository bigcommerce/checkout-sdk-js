import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createBigCommercePaymentsIntegrationService from '../create-bigcommerce-payments-integration-service';

import BigCommercePaymentsVenmoButtonStrategy from './bigcommerce-payments-venmo-button-strategy';

const createBigCommercePaymentsVenmoButtonStrategy: CheckoutButtonStrategyFactory<
    BigCommercePaymentsVenmoButtonStrategy
> = (paymentIntegrationService) =>
    new BigCommercePaymentsVenmoButtonStrategy(
        paymentIntegrationService,
        createBigCommercePaymentsIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createBigCommercePaymentsVenmoButtonStrategy, [
    { id: 'bigcommerce_payments_venmo' },
]);
