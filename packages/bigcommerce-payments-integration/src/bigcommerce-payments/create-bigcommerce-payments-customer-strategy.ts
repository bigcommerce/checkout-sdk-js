import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createBigCommercePaymentsIntegrationService from '../create-bigcommerce-payments-integration-service';

import BigCommercePaymentsCustomerStrategy from './bigcommerce-payments-customer-strategy';

const createBigCommercePaymentsCustomerStrategy: CustomerStrategyFactory<
    BigCommercePaymentsCustomerStrategy
> = (paymentIntegrationService) =>
    new BigCommercePaymentsCustomerStrategy(
        paymentIntegrationService,
        createBigCommercePaymentsIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createBigCommercePaymentsCustomerStrategy, [
    { id: 'bigcommerce_payments' },
]);
