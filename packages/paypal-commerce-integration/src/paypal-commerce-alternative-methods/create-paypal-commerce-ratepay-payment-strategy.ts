import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';
import PaypalCommerceRatepayPaymentStrategy from './paypal-commerce-ratepay-payment-strategy';

const createPaypalCommerceRatepayPaymentStrategy: PaymentStrategyFactory<
    PaypalCommerceRatepayPaymentStrategy
> = (paymentIntegrationService) =>
    new PaypalCommerceRatepayPaymentStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createPaypalCommerceRatepayPaymentStrategy, [
    { gateway: 'paypalcommercealternativemethods', id: 'ratepay' },
]);
