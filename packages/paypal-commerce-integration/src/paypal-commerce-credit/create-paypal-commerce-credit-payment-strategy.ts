import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalCommerceSdk,
    LOADING_INDICATOR_STYLES,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';

import PayPalCommerceCreditPaymentStrategy from './paypal-commerce-credit-payment-strategy';

const createPayPalCommerceCreditPaymentStrategy: PaymentStrategyFactory<
    PayPalCommerceCreditPaymentStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceCreditPaymentStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
        new LoadingIndicator({
            containerStyles: LOADING_INDICATOR_STYLES,
        }),
        createPayPalCommerceSdk(),
    );

export default toResolvableModule(createPayPalCommerceCreditPaymentStrategy, [
    { id: 'paypalcommercecredit' },
]);
