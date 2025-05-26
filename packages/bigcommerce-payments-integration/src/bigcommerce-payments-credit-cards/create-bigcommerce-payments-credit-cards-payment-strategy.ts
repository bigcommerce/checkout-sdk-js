import {
    createBigCommercePaymentsFastlaneUtils,
    createBigCommercePaymentsSdk,
} from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createBigCommercePaymentsIntegrationService from '../create-bigcommerce-payments-integration-service';

import BigCommercePaymentsCreditCardsPaymentStrategy from './bigcommerce-payments-credit-cards-payment-strategy';

const createBigCommercePaymentsCreditCardsPaymentStrategy: PaymentStrategyFactory<
    BigCommercePaymentsCreditCardsPaymentStrategy
> = (paymentIntegrationService) =>
    new BigCommercePaymentsCreditCardsPaymentStrategy(
        paymentIntegrationService,
        createBigCommercePaymentsIntegrationService(paymentIntegrationService),
        createBigCommercePaymentsSdk(),
        createBigCommercePaymentsFastlaneUtils(),
    );

export default toResolvableModule(createBigCommercePaymentsCreditCardsPaymentStrategy, [
    { id: 'bigcommerce_payments_creditcards' },
]);
