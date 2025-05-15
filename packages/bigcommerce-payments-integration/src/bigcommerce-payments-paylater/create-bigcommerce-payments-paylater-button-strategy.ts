import { createBigCommercePaymentsSdk } from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createBigCommercePaymentsIntegrationService from '../create-bigcommerce-payments-integration-service';

import BigCommercePaymentsPayLaterButtonStrategy from './bigcommerce-payments-paylater-button-strategy';

const createBigCommercePaymentsPayLaterButtonStrategy: CheckoutButtonStrategyFactory<
    BigCommercePaymentsPayLaterButtonStrategy
> = (paymentIntegrationService) =>
    new BigCommercePaymentsPayLaterButtonStrategy(
        paymentIntegrationService,
        createBigCommercePaymentsIntegrationService(paymentIntegrationService),
        createBigCommercePaymentsSdk(),
    );

export default toResolvableModule(createBigCommercePaymentsPayLaterButtonStrategy, [
    { id: 'bigcommerce_payments_paylater' },
]);
