import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';
import PayPalCommerceAlternativeMethodRatePayPaymentStrategy from './paypal-commerce-alternative-method-ratepay-payment-strategy';


const createPayPalCommerceAlternativeMethodRatePayPaymentStrategy: PaymentStrategyFactory<
    any // TODO: FIX
> = (paymentIntegrationService) =>
    new PayPalCommerceAlternativeMethodRatePayPaymentStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
        new LoadingIndicator({ styles: { backgroundColor: 'black' } }),
    );

export default toResolvableModule(createPayPalCommerceAlternativeMethodRatePayPaymentStrategy, [
    { gateway: 'paypalcommercealternativemethods', id:'ratepay' },
]);
