import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';
import { LOADING_INDICATOR_STYLES } from '../paypal-commerce-constants';

import PaypalCommerceRatepayPaymentStrategy from './paypal-commerce-ratepay-payment-strategy';

const createPaypalCommerceRatepayPaymentStrategy: PaymentStrategyFactory<
    PaypalCommerceRatepayPaymentStrategy
> = (paymentIntegrationService) =>
    new PaypalCommerceRatepayPaymentStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
        new LoadingIndicator({
            containerStyles: { ...LOADING_INDICATOR_STYLES, position: 'fixed' },
        }),
    );

export default toResolvableModule(createPaypalCommerceRatepayPaymentStrategy, [
    { gateway: 'paypalcommercealternativemethods', id: 'ratepay' },
]);
