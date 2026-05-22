import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import {
    createPayPalIntegrationService,
    LOADING_INDICATOR_STYLES,
} from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceVenmoPaymentStrategy from './paypal-commerce-venmo-payment-strategy';

const createPayPalCommerceVenmoPaymentStrategy: PaymentStrategyFactory<
    PayPalCommerceVenmoPaymentStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceVenmoPaymentStrategy(
        paymentIntegrationService,
        createPayPalIntegrationService(paymentIntegrationService),
        new LoadingIndicator({
            containerStyles: LOADING_INDICATOR_STYLES,
            styles: { backgroundColor: 'black' },
        }),
    );

export default toResolvableModule(createPayPalCommerceVenmoPaymentStrategy, [
    { id: 'paypalcommercevenmo' },
]);
