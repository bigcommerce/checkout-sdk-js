import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalIntegrationService,
    LOADING_INDICATOR_STYLES,
} from '@bigcommerce/checkout-sdk/paypal-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import PaypalCommerceRatepayPaymentStrategy from './paypal-commerce-ratepay-payment-strategy';

const createPaypalCommerceRatepayPaymentStrategy: PaymentStrategyFactory<
    PaypalCommerceRatepayPaymentStrategy
> = (paymentIntegrationService) =>
    new PaypalCommerceRatepayPaymentStrategy(
        paymentIntegrationService,
        createPayPalIntegrationService(paymentIntegrationService),
        new LoadingIndicator({
            containerStyles: { ...LOADING_INDICATOR_STYLES, position: 'fixed' },
        }),
    );

export default toResolvableModule(createPaypalCommerceRatepayPaymentStrategy, [
    { gateway: 'paypalcommercealternativemethods', id: 'ratepay' },
]);
