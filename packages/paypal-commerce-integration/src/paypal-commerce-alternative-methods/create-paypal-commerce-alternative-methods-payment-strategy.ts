import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';

import PayPalCommerceAlternativeMethodsPaymentStrategy from './paypal-commerce-alternative-methods-payment-strategy';

const createPayPalCommerceAlternativeMethodsPaymentStrategy: PaymentStrategyFactory<
    PayPalCommerceAlternativeMethodsPaymentStrategy
> = (paymentIntegrationService) =>
    new PayPalCommerceAlternativeMethodsPaymentStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
        new LoadingIndicator({ styles: { backgroundColor: 'black' } }),
    );

export default toResolvableModule(createPayPalCommerceAlternativeMethodsPaymentStrategy, [
    { gateway: 'paypalcommercealternativemethods' },
]);
