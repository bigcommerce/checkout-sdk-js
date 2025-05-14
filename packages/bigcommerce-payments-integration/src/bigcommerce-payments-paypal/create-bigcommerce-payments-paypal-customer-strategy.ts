import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createBigCommercePaymentsIntegrationService from '../create-bigcommerce-payments-integration-service';

import BigCommercePaymentsPayPalCustomerStrategy from './bigcommerce-payments-paypal-customer-strategy';

const createBigCommercePaymentsPayPalCustomerStrategy: CustomerStrategyFactory<
    BigCommercePaymentsPayPalCustomerStrategy
> = (paymentIntegrationService) =>
    new BigCommercePaymentsPayPalCustomerStrategy(
        paymentIntegrationService,
        createBigCommercePaymentsIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createBigCommercePaymentsPayPalCustomerStrategy, [
    { id: 'bigcommerce_payments_paypal' },
]);
