import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalCommerceFastlaneUtils,
    createPayPalCommerceSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import createBigCommerceIntegrationService from '../create-big-commerce-integration-service';

import BigCommerceCreditCardsPaymentStrategy from './big-commerce-credit-cards-payment-strategy';

const createBigCommerceCreditCardsPaymentStrategy: PaymentStrategyFactory<
    BigCommerceCreditCardsPaymentStrategy
> = (paymentIntegrationService) =>
    new BigCommerceCreditCardsPaymentStrategy(
        paymentIntegrationService,
        createBigCommerceIntegrationService(paymentIntegrationService),
        createPayPalCommerceSdk(),
        createPayPalCommerceFastlaneUtils(),
    );

export default toResolvableModule(createBigCommerceCreditCardsPaymentStrategy, [
    { id: 'bigcommerce_payments_creditcard' },
]);
