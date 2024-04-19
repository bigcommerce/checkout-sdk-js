import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';

import PayPalCommerceVenmoPaymentStrategy from './paypal-commerce-venmo-payment-strategy';

const createPayPalCommerceVenmoPaymentStrategy: PaymentStrategyFactory<
    PayPalCommerceVenmoPaymentStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceVenmoPaymentStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
        new LoadingIndicator({ styles: { backgroundColor: 'black' } }),
    );

export default toResolvableModule(createPayPalCommerceVenmoPaymentStrategy, [
    { id: 'paypalcommercevenmo' },
]);
