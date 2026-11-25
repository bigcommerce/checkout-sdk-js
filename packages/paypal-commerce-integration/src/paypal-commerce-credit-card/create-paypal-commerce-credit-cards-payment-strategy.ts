import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { createPayPalIntegrationService } from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceCreditCardsPaymentStrategy from './paypal-commerce-credit-cards-payment-strategy';

const createPaypalCommerceCreditCardsPaymentStrategy: PaymentStrategyFactory<
    PayPalCommerceCreditCardsPaymentStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceCreditCardsPaymentStrategy(
        paymentIntegrationService,
        createPayPalIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createPaypalCommerceCreditCardsPaymentStrategy, [
    { id: 'paypalcommercecreditcards' },
]);
