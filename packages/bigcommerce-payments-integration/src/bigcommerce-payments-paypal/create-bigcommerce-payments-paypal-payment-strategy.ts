import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import { LOADING_INDICATOR_STYLES } from '../bigcommerce-payments-constants';
import createBigCommercePaymentsIntegrationService from '../create-bigcommerce-payments-integration-service';

import BigCommercePaymentsPayPalPaymentStrategy from './bigcommerce-payments-paypal-payment-strategy';

const createBigCommercePaymentsPayPalPaymentStrategy: PaymentStrategyFactory<
    BigCommercePaymentsPayPalPaymentStrategy
> = (paymentIntegrationService) =>
    new BigCommercePaymentsPayPalPaymentStrategy(
        paymentIntegrationService,
        createBigCommercePaymentsIntegrationService(paymentIntegrationService),
        new LoadingIndicator({
            containerStyles: LOADING_INDICATOR_STYLES,
        }),
    );

export default toResolvableModule(createBigCommercePaymentsPayPalPaymentStrategy, [
    { id: 'bigcommerce_payments_paypal' },
]);
