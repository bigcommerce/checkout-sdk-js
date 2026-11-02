import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalIntegrationService,
    createPayPalSdkScriptLoader,
    LOADING_INDICATOR_STYLES,
} from '@bigcommerce/checkout-sdk/paypal-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import BigCommercePaymentsPaymentStrategy from './bigcommerce-payments-payment-strategy';

const createBigCommercePaymentsPaymentStrategy: PaymentStrategyFactory<
    BigCommercePaymentsPaymentStrategy
> = (paymentIntegrationService) =>
    new BigCommercePaymentsPaymentStrategy(
        paymentIntegrationService,
        createPayPalIntegrationService(paymentIntegrationService),
        createPayPalSdkScriptLoader(),
        new LoadingIndicator({
            containerStyles: LOADING_INDICATOR_STYLES,
        }),
    );

export default toResolvableModule(createBigCommercePaymentsPaymentStrategy, [
    { id: 'bigcommerce_payments' },
]);
