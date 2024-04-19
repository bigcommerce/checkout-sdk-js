import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { createPayPalCommerceSdk } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';

import PayPalCommerceCreditButtonStrategy from './paypal-commerce-credit-button-strategy';

const createPayPalCommerceCreditButtonStrategy: CheckoutButtonStrategyFactory<
    PayPalCommerceCreditButtonStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceCreditButtonStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
        createPayPalCommerceSdk(),
    );

export default toResolvableModule(createPayPalCommerceCreditButtonStrategy, [
    { id: 'paypalcommercecredit' },
]);
