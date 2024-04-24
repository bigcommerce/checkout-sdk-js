import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import CheckoutComSepaPaymentStrategy from './checkoutcom-sepa-payment-strategy';

const createCheckoutComSepaPaymentStrategy: PaymentStrategyFactory<
    CheckoutComSepaPaymentStrategy
> = (paymentIntegrationService) => {
    return new CheckoutComSepaPaymentStrategy(paymentIntegrationService);
};

export default toResolvableModule(createCheckoutComSepaPaymentStrategy, [
    { gateway: 'checkoutcom', id: 'sepa' },
]);
