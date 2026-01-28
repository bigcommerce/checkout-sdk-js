import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { createPayPalIntegrationService } from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceAlternativeMethodsButtonStrategy from './paypal-commerce-alternative-methods-button-strategy';

const createPayPalCommerceAlternativeMethodsButtonStrategy: CheckoutButtonStrategyFactory<
    PayPalCommerceAlternativeMethodsButtonStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceAlternativeMethodsButtonStrategy(
        paymentIntegrationService,
        createPayPalIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createPayPalCommerceAlternativeMethodsButtonStrategy, [
    { id: 'paypalcommercealternativemethods' },
]);
