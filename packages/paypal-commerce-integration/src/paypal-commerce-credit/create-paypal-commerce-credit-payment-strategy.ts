import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';

import PayPalCommerceCreditPaymentStrategy from './paypal-commerce-credit-payment-strategy';

const createPayPalCommerceCreditPaymentStrategy: PaymentStrategyFactory<
    PayPalCommerceCreditPaymentStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceCreditPaymentStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
        new LoadingIndicator({ styles: { backgroundColor: 'black' } }),
    );

export default toResolvableModule(createPayPalCommerceCreditPaymentStrategy, [
    { id: 'paypalcommercecredit' },
]);
