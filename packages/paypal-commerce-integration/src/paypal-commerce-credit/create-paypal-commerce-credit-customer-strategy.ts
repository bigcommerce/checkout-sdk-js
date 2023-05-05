import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';

import PayPalCommerceCreditCustomerStrategy from './paypal-commerce-credit-customer-strategy';

const createPayPalCommerceCreditCustomerStrategy: CustomerStrategyFactory<
    PayPalCommerceCreditCustomerStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceCreditCustomerStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createPayPalCommerceCreditCustomerStrategy, [
    { id: 'paypalcommercecredit' },
]);
