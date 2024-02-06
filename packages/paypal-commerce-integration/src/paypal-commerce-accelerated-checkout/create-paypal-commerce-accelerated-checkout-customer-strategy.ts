import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalCommerceAcceleratedCheckoutUtils,
    createPayPalCommerceSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import PayPalCommerceAcceleratedCheckoutCustomerStrategy from './paypal-commerce-accelerated-checkout-customer-strategy';

const createPayPalCommerceAcceleratedCheckoutCustomerStrategy: CustomerStrategyFactory<
    PayPalCommerceAcceleratedCheckoutCustomerStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceAcceleratedCheckoutCustomerStrategy(
        paymentIntegrationService,
        createPayPalCommerceSdk(),
        createPayPalCommerceAcceleratedCheckoutUtils(),
    );

export default toResolvableModule(createPayPalCommerceAcceleratedCheckoutCustomerStrategy, [
    { id: 'paypalcommerceacceleratedcheckout' },
    { id: 'paypalcommercecreditcards' },
]);
