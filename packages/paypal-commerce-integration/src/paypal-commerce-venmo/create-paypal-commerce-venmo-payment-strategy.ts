import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import { createPayPalIntegrationService } from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceVenmoPaymentStrategy from './paypal-commerce-venmo-payment-strategy';

const createPayPalCommerceVenmoPaymentStrategy: PaymentStrategyFactory<
    PayPalCommerceVenmoPaymentStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceVenmoPaymentStrategy(
        paymentIntegrationService,
        createPayPalIntegrationService(paymentIntegrationService),
        new LoadingIndicator({ styles: { backgroundColor: 'black' } }),
    );

export default toResolvableModule(createPayPalCommerceVenmoPaymentStrategy, [
    { id: 'paypalcommercevenmo' },
]);
