import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';

import PayPalCommerceAlternativeMethodsButtonStrategy from './paypal-commerce-alternative-methods-button-strategy';

const createPayPalCommerceAlternativeMethodsButtonStrategy: CheckoutButtonStrategyFactory<
    PayPalCommerceAlternativeMethodsButtonStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceAlternativeMethodsButtonStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createPayPalCommerceAlternativeMethodsButtonStrategy, [
    { id: 'paypalcommercealternativemethods' },
]);
