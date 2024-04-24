import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import CheckoutComCustomPaymentStrategy from '../checkoutcom-custom-payment-strategy';

import CheckoutComAPMPaymentStrategy from './checkoutcom-apm-payment-strategy';

const createCheckoutComAPMPaymentStrategy: PaymentStrategyFactory<
    CheckoutComCustomPaymentStrategy
> = (paymentIntegrationService) => {
    return new CheckoutComAPMPaymentStrategy(paymentIntegrationService);
};

export default toResolvableModule(createCheckoutComAPMPaymentStrategy, [
    { gateway: 'checkoutcom' },
]);
