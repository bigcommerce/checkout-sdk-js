import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';

import PayPalCommerceCreditCardsPaymentStrategy from './paypal-commerce-credit-cards-payment-strategy';

const createPaypalCommerceCreditCardsPaymentStrategy: PaymentStrategyFactory<
    PayPalCommerceCreditCardsPaymentStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceCreditCardsPaymentStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createPaypalCommerceCreditCardsPaymentStrategy, [
    { id: 'paypalcommercecreditcards' },
]);
