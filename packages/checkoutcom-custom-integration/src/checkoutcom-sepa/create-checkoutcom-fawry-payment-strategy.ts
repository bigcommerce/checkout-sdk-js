import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import CheckoutComFawryPaymentStrategy from './checkoutcom-fawry-payment-strategy';

const createCheckoutComFawryPaymentStrategy: PaymentStrategyFactory<
    CheckoutComFawryPaymentStrategy
> = (paymentIntegrationService) => {
    return new CheckoutComFawryPaymentStrategy(paymentIntegrationService);
};

export default toResolvableModule(createCheckoutComFawryPaymentStrategy, [
    { gateway: 'checkoutcom', id: 'fawry' },
]);
