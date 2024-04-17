import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import CheckoutComiDealPaymentStrategy from './checkoutcom-ideal-payment-strategy';

const createCheckoutComiDealPaymentStrategy: PaymentStrategyFactory<
    CheckoutComiDealPaymentStrategy
> = (paymentIntegrationService) => {
    return new CheckoutComiDealPaymentStrategy(paymentIntegrationService);
};

export default toResolvableModule(createCheckoutComiDealPaymentStrategy, [
    { gateway: 'checkoutcom', id: 'ideal' },
]);
