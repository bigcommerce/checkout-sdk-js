import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createBigCommerceIntegrationService from '../create-big-commerce-integration-service';

import BigCommerceCustomerStrategy from './big-commerce-customer-strategy';

const createBigCommerceCustomerStrategy: CustomerStrategyFactory<BigCommerceCustomerStrategy> = (
    paymentIntegrationService,
) =>
    new BigCommerceCustomerStrategy(
        paymentIntegrationService,
        createBigCommerceIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createBigCommerceCustomerStrategy, [{ id: 'bigcommerce' }]);
