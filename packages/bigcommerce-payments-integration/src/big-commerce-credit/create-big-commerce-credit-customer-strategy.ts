import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createBigCommerceIntegrationService from '../create-big-commerce-integration-service';

import BigCommerceCreditCustomerStrategy from './big-commerce-credit-customer-strategy';

const createBigCommerceCreditCustomerStrategy: CustomerStrategyFactory<
    BigCommerceCreditCustomerStrategy
> = (paymentIntegrationService) =>
    new BigCommerceCreditCustomerStrategy(
        paymentIntegrationService,
        createBigCommerceIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createBigCommerceCreditCustomerStrategy, [
    { id: 'bigcommerce_payments_paylater' },
]);
