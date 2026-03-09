import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalIntegrationService,
    createPayPalSdkScriptLoader,
    LOADING_INDICATOR_STYLES,
} from '@bigcommerce/checkout-sdk/paypal-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import PayPalCommerceCreditPaymentStrategy from './paypal-commerce-credit-payment-strategy';

const createPayPalCommerceCreditPaymentStrategy: PaymentStrategyFactory<
    PayPalCommerceCreditPaymentStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceCreditPaymentStrategy(
        paymentIntegrationService,
        createPayPalIntegrationService(paymentIntegrationService),
        new LoadingIndicator({
            containerStyles: LOADING_INDICATOR_STYLES,
        }),
        createPayPalSdkScriptLoader(),
    );

export default toResolvableModule(createPayPalCommerceCreditPaymentStrategy, [
    { id: 'paypalcommercecredit' },
]);
