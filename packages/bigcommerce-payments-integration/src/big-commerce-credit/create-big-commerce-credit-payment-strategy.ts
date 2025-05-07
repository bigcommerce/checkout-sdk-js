import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { createPayPalCommerceSdk } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import { LOADING_INDICATOR_STYLES } from '../big-commerce-constants';
import createBigCommerceIntegrationService from '../create-big-commerce-integration-service';

import BigCommerceCreditPaymentStrategy from './big-commerce-credit-payment-strategy';

const createBigCommerceCreditPaymentStrategy: PaymentStrategyFactory<
    BigCommerceCreditPaymentStrategy
> = (paymentIntegrationService) =>
    new BigCommerceCreditPaymentStrategy(
        paymentIntegrationService,
        createBigCommerceIntegrationService(paymentIntegrationService),
        new LoadingIndicator({
            containerStyles: LOADING_INDICATOR_STYLES,
        }),
        createPayPalCommerceSdk(),
    );

export default toResolvableModule(createBigCommerceCreditPaymentStrategy, [
    { id: 'bigcommerce_payments_paylater' },
]);
