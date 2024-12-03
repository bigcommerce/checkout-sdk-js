import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';

import PaypalCommerceHeadlessButtonStrategy from "./paypal-commerce-headless-button-strategy";

const createPayPalCommerceHeadlessButtonStrategy: CheckoutButtonStrategyFactory<
    PaypalCommerceHeadlessButtonStrategy
> = (paymentIntegrationService) =>
    new PaypalCommerceHeadlessButtonStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createPayPalCommerceHeadlessButtonStrategy, [{ id: 'paypalcommerce' }]);
