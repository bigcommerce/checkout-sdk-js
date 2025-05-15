import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createBigCommercePaymentsIntegrationService from '../create-bigcommerce-payments-integration-service';

import BigCommercePaymentsPayLaterCustomerStrategy from './bigcommerce-payments-paylater-customer-strategy';

const createBigCommercePaymentsPayLaterCustomerStrategy: CustomerStrategyFactory<
    BigCommercePaymentsPayLaterCustomerStrategy
> = (paymentIntegrationService) =>
    new BigCommercePaymentsPayLaterCustomerStrategy(
        paymentIntegrationService,
        createBigCommercePaymentsIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createBigCommercePaymentsPayLaterCustomerStrategy, [
    { id: 'bigcommerce_payments_paylater' },
]);
