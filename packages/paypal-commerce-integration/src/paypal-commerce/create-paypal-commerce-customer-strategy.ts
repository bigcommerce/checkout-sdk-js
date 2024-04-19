import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';

import PayPalCommerceCustomerStrategy from './paypal-commerce-customer-strategy';

const createPayPalCommerceCustomerStrategy: CustomerStrategyFactory<
    PayPalCommerceCustomerStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceCustomerStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createPayPalCommerceCustomerStrategy, [{ id: 'paypalcommerce' }]);
