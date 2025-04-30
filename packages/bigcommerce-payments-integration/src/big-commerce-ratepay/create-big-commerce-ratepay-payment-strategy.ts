import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import { LOADING_INDICATOR_STYLES } from '../big-commerce-constants';
import createPayPalCommerceIntegrationService from '../create-big-commerce-integration-service';

import BigCommerceRatepayPaymentStrategy from './big-commerce-ratepay-payment-strategy';

const createBigCommerceRatepayPaymentStrategy: PaymentStrategyFactory<
    BigCommerceRatepayPaymentStrategy
> = (paymentIntegrationService) =>
    new BigCommerceRatepayPaymentStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
        new LoadingIndicator({
            containerStyles: { ...LOADING_INDICATOR_STYLES, position: 'fixed' },
        }),
    );

export default toResolvableModule(createBigCommerceRatepayPaymentStrategy, [
    { gateway: 'paypalcommercealternativemethods', id: 'ratepay' },
]);
