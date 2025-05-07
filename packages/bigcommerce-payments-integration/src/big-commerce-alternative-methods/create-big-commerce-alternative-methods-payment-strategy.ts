import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { createPayPalCommerceSdk } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import { LOADING_INDICATOR_STYLES } from '../big-commerce-constants';
import createBigCommerceIntegrationService from '../create-big-commerce-integration-service';

import BigCommerceAlternativeMethodsPaymentStrategy from './big-commerce-alternative-methods-payment-strategy';
import createPayPalCommerceIntegrationService from 'packages/paypal-commerce-integration/src/create-paypal-commerce-integration-service'; // TODO: remove this import after implementing bigcommerce-utils

const createBigCommerceAlternativeMethodsPaymentStrategy: PaymentStrategyFactory<
    BigCommerceAlternativeMethodsPaymentStrategy
> = (paymentIntegrationService) =>
        new BigCommerceAlternativeMethodsPaymentStrategy(
            paymentIntegrationService,
            createBigCommerceIntegrationService(paymentIntegrationService),
            createPayPalCommerceIntegrationService(paymentIntegrationService), // TODO: remove this import after implementing bigcommerce-utils
            createPayPalCommerceSdk(),
            new LoadingIndicator({
                containerStyles: LOADING_INDICATOR_STYLES,
            }),
        );

export default toResolvableModule(createBigCommerceAlternativeMethodsPaymentStrategy, [
    { gateway: 'bigcommerce_payments_apms' },
]);
