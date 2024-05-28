import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { createPayPalCommerceSdk } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';
import { LOADING_INDICATOR_STYLES } from '../paypal-commerce-constants';

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
