import { createBigCommercePaymentsSdk } from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import { LOADING_INDICATOR_STYLES } from '../bigcommerce-payments-constants';
import createBigCommercePaymentsIntegrationService from '../create-bigcommerce-payments-integration-service';

import BigCommercePaymentsPayLaterPaymentStrategy from './bigcommerce-payments-paylater-payment-strategy';

const createBigCommercePaymentsPayLaterPaymentStrategy: PaymentStrategyFactory<
    BigCommercePaymentsPayLaterPaymentStrategy
> = (paymentIntegrationService) =>
    new BigCommercePaymentsPayLaterPaymentStrategy(
        paymentIntegrationService,
        createBigCommercePaymentsIntegrationService(paymentIntegrationService),
        new LoadingIndicator({
            containerStyles: LOADING_INDICATOR_STYLES,
        }),
        createBigCommercePaymentsSdk(),
    );

export default toResolvableModule(createBigCommercePaymentsPayLaterPaymentStrategy, [
    { id: 'bigcommerce_payments_paylater' },
]);
