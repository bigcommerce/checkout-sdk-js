import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';

import PayPalCommerceAcceleratedCheckoutPaymentStrategy from './paypal-commerce-accelerated-checkout-payment-strategy';

const createPayPalCommerceAcceleratedCheckoutPaymentStrategy: PaymentStrategyFactory<
    PayPalCommerceAcceleratedCheckoutPaymentStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceAcceleratedCheckoutPaymentStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
        new BrowserStorage('paypalConnect'),
    );

export default toResolvableModule(createPayPalCommerceAcceleratedCheckoutPaymentStrategy, [
    { id: 'paypalcommerceacceleratedcheckout' },
]);
