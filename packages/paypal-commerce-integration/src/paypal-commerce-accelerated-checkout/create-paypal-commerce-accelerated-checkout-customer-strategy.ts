import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';

import PayPalCommerceAcceleratedCheckoutCustomerStrategy from './paypal-commerce-accelerated-checkout-customer-strategy';

const createPayPalCommerceAcceleratedCheckoutCustomerStrategy: CustomerStrategyFactory<
    PayPalCommerceAcceleratedCheckoutCustomerStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceAcceleratedCheckoutCustomerStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
        new BrowserStorage('paypalConnect'),
    );

export default toResolvableModule(createPayPalCommerceAcceleratedCheckoutCustomerStrategy, [
    { id: 'paypalcommerceacceleratedcheckout' },
    { id: 'paypalcommerce' },
]);
