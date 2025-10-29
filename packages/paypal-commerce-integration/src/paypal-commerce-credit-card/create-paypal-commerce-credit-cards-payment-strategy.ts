import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalFastlaneUtils,
    createPaypalSdkScriptLoader,
} from '@bigcommerce/checkout-sdk/paypal-utils';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';

import PayPalCommerceCreditCardsPaymentStrategy from './paypal-commerce-credit-cards-payment-strategy';

const createPaypalCommerceCreditCardsPaymentStrategy: PaymentStrategyFactory<
    PayPalCommerceCreditCardsPaymentStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceCreditCardsPaymentStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
        createPaypalSdkScriptLoader(),
        createPayPalFastlaneUtils(),
    );

export default toResolvableModule(createPaypalCommerceCreditCardsPaymentStrategy, [
    { id: 'paypalcommercecreditcards' },
]);
