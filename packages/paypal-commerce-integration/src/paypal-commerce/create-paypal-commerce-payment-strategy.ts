import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalIntegrationService,
    LOADING_INDICATOR_STYLES,
    PayPalSdkScriptLoader,
} from '@bigcommerce/checkout-sdk/paypal-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import PayPalCommercePaymentStrategy from './paypal-commerce-payment-strategy';

const createPayPalCommercePaymentStrategy: PaymentStrategyFactory<PayPalCommercePaymentStrategy> = (
    paymentIntegrationService,
) =>
    new PayPalCommercePaymentStrategy(
        paymentIntegrationService,
        createPayPalIntegrationService(paymentIntegrationService),
        new PayPalSdkScriptLoader(getScriptLoader()),
        new LoadingIndicator({
            containerStyles: LOADING_INDICATOR_STYLES,
        }),
    );

export default toResolvableModule(createPayPalCommercePaymentStrategy, [{ id: 'paypalcommerce' }]);
