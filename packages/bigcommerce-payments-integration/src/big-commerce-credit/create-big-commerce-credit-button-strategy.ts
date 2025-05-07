import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { createPayPalCommerceSdk } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import createBigCommerceIntegrationService from '../create-big-commerce-integration-service';

import BigCommerceCreditButtonStrategy from './big-commerce-credit-button-strategy';

const createBigCommerceCreditButtonStrategy: CheckoutButtonStrategyFactory<
    BigCommerceCreditButtonStrategy
> = (paymentIntegrationService) =>
    new BigCommerceCreditButtonStrategy(
        paymentIntegrationService,
        createBigCommerceIntegrationService(paymentIntegrationService),
        createPayPalCommerceSdk(), // TODO: Doublecheck should we leave it or change to bigCommerceSdk?
    );

export default toResolvableModule(createBigCommerceCreditButtonStrategy, [
    { id: 'bigcommerce_payments_paylater' },
]);
