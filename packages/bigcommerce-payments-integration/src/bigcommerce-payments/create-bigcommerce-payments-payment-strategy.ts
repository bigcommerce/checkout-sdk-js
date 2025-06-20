import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import { LOADING_INDICATOR_STYLES } from '../bigcommerce-payments-constants';
import createBigCommercePaymentsIntegrationService from '../create-bigcommerce-payments-integration-service';

import BigCommercePaymentsPaymentStrategy from './bigcommerce-payments-payment-strategy';

const createBigCommercePaymentsPaymentStrategy: PaymentStrategyFactory<
    BigCommercePaymentsPaymentStrategy
> = (paymentIntegrationService) =>
    new BigCommercePaymentsPaymentStrategy(
        paymentIntegrationService,
        createBigCommercePaymentsIntegrationService(paymentIntegrationService),
        new LoadingIndicator({
            containerStyles: LOADING_INDICATOR_STYLES,
        }),
    );

export default toResolvableModule(createBigCommercePaymentsPaymentStrategy, [
    { id: 'bigcommerce_payments' },
]);
