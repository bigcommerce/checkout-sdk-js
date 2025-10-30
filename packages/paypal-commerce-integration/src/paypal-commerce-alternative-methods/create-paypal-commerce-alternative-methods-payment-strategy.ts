import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { createPayPalSdkScriptLoader } from '@bigcommerce/checkout-sdk/paypal-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';
import { LOADING_INDICATOR_STYLES } from '../paypal-commerce-constants';

import PayPalCommerceAlternativeMethodsPaymentStrategy from './paypal-commerce-alternative-methods-payment-strategy';

const createPayPalCommerceAlternativeMethodsPaymentStrategy: PaymentStrategyFactory<
    PayPalCommerceAlternativeMethodsPaymentStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceAlternativeMethodsPaymentStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
        createPayPalSdkScriptLoader(),
        new LoadingIndicator({
            containerStyles: LOADING_INDICATOR_STYLES,
        }),
    );

export default toResolvableModule(createPayPalCommerceAlternativeMethodsPaymentStrategy, [
    { gateway: 'paypalcommercealternativemethods' },
]);
