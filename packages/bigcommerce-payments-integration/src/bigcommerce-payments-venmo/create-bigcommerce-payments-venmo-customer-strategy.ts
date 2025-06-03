import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createBigCommercePaymentsIntegrationService from '../create-bigcommerce-payments-integration-service';

import BigCommercePaymentsVenmoCustomerStrategy from './bigcommerce-payments-venmo-customer-strategy';

const createBigCommercePaymentsVenmoCustomerStrategy: CustomerStrategyFactory<
    BigCommercePaymentsVenmoCustomerStrategy
> = (paymentIntegrationService) =>
    new BigCommercePaymentsVenmoCustomerStrategy(
        paymentIntegrationService,
        createBigCommercePaymentsIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createBigCommercePaymentsVenmoCustomerStrategy, [
    { id: 'bigcommerce_payments_venmo' },
]);
