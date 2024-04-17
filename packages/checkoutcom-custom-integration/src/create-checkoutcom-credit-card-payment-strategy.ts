import { createFormPoster } from '@bigcommerce/form-poster';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import CheckoutComCreditCardPaymentStrategy from './checkoutcom-credit-card-payment-strategy';

const createCheckoutComCreditCardPaymentStrategy: PaymentStrategyFactory<
    CheckoutComCreditCardPaymentStrategy
> = (paymentIntegrationService) => {
    return new CheckoutComCreditCardPaymentStrategy(paymentIntegrationService, createFormPoster());
};

export default toResolvableModule(createCheckoutComCreditCardPaymentStrategy, [
    { gateway: 'checkoutcom', id: 'credit_card' },
    { gateway: 'checkoutcom', id: 'card' },
]);
