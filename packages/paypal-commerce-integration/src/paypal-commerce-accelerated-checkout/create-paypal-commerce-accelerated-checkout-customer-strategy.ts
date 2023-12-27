import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';

import PaypalCommerceAcceleratedCheckoutCustomerStrategy
    from './paypal-commerce-accelerated-checkout-customer-strategy';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

const createPayPalCommerceAcceleratedCheckoutCustomerStrategy: CustomerStrategyFactory<
    PaypalCommerceAcceleratedCheckoutCustomerStrategy
> = (paymentIntegrationService) =>
    new PaypalCommerceAcceleratedCheckoutCustomerStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
        new BrowserStorage('paypalConnect'),
    );

export default toResolvableModule(createPayPalCommerceAcceleratedCheckoutCustomerStrategy, [{ id: 'paypalcommerceacceleratedcheckout' }]);
