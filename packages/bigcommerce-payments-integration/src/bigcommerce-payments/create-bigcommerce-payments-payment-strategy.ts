import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import { LOADING_INDICATOR_STYLES } from '../bigcommerce-payments-constants';
import createBigCommercePaymentsIntegrationService from '../create-bigcommerce-payments-integration-service';

import BigcommercePaymentsPaymentStrategy from './bigcommerce-payments-payment-strategy';

const createBigCommercePaymentsPaymentStrategy: PaymentStrategyFactory<
    BigcommercePaymentsPaymentStrategy
> = (paymentIntegrationService) =>
    new BigcommercePaymentsPaymentStrategy(
        paymentIntegrationService,
        createBigCommercePaymentsIntegrationService(paymentIntegrationService),
        new LoadingIndicator({
            containerStyles: LOADING_INDICATOR_STYLES,
        }),
    );

export default toResolvableModule(createBigCommercePaymentsPaymentStrategy, [
    { id: 'bigcommerce_payments' },
]);
