import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PayPalCommerceSdk } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';
import { LOADING_INDICATOR_STYLES } from '../paypal-commerce-constants';

import PayPalCommercePaymentStrategy from './paypal-commerce-payment-strategy';

const createPayPalCommercePaymentStrategy: PaymentStrategyFactory<PayPalCommercePaymentStrategy> = (
    paymentIntegrationService,
) =>
    new PayPalCommercePaymentStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
        new PayPalCommerceSdk(getScriptLoader()),
        new LoadingIndicator({
            containerStyles: LOADING_INDICATOR_STYLES,
        }),
    );

export default toResolvableModule(createPayPalCommercePaymentStrategy, [{ id: 'paypalcommerce' }]);
