import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';
import { LOADING_INDICATOR_STYLES } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import PayPalCommercePaymentStrategy from './paypal-commerce-payment-strategy';

const createPayPalCommercePaymentStrategy: PaymentStrategyFactory<PayPalCommercePaymentStrategy> = (
    paymentIntegrationService,
) =>
    new PayPalCommercePaymentStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
        new LoadingIndicator({
            containerStyles: LOADING_INDICATOR_STYLES,
        }),
    );

export default toResolvableModule(createPayPalCommercePaymentStrategy, [{ id: 'paypalcommerce' }]);
