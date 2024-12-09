import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';

import PayPalCommerceCreditHeadlessButtonStrategy from './paypal-commerce-credit-headless-button-strategy';

const createPayPalCommerceHeadlessButtonStrategy: CheckoutButtonStrategyFactory<
    PayPalCommerceCreditHeadlessButtonStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceCreditHeadlessButtonStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createPayPalCommerceHeadlessButtonStrategy, [
    { id: 'paypalcommercecredit' },
]);
