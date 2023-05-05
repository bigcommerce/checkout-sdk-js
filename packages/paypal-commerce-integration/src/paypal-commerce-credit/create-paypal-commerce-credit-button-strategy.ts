import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';

import PayPalCommerceCreditButtonStrategy from './paypal-commerce-credit-button-strategy';

const createPayPalCommerceCreditButtonStrategy: CheckoutButtonStrategyFactory<
    PayPalCommerceCreditButtonStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceCreditButtonStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createPayPalCommerceCreditButtonStrategy, [
    { id: 'paypalcommercecredit' },
]);
