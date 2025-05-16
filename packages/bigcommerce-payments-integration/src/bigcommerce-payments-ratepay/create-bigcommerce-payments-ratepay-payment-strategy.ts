import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import { LOADING_INDICATOR_STYLES } from '../bigcommerce-payments-constants';
import createBigCommercePaymentsIntegrationService from '../create-bigcommerce-payments-integration-service';

import BigCommercePaymentsRatePayPaymentStrategy from './bigcommerce-payments-ratepay-payment-strategy';

const createBigCommercePaymentsRatePayPaymentStrategy: PaymentStrategyFactory<
    BigCommercePaymentsRatePayPaymentStrategy
> = (paymentIntegrationService) =>
    new BigCommercePaymentsRatePayPaymentStrategy(
        paymentIntegrationService,
        createBigCommercePaymentsIntegrationService(paymentIntegrationService),
        new LoadingIndicator({
            containerStyles: { ...LOADING_INDICATOR_STYLES, position: 'fixed' },
        }),
    );

export default toResolvableModule(createBigCommercePaymentsRatePayPaymentStrategy, [
    { gateway: 'bigcommerce_payments_apms', id: 'ratepay' },
]);
