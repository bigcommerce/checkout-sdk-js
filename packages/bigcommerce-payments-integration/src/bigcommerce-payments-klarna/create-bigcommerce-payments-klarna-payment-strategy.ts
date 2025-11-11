import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createBigCommercePaymentsIntegrationService from '../create-bigcommerce-payments-integration-service';

import BigCommercePaymentsKlarnaPaymentStrategy from './bigcomemrce-payments-klarna-payment-strategy';

const createBigCommercePaymentsKlarnaPaymentStrategy: PaymentStrategyFactory<
    BigCommercePaymentsKlarnaPaymentStrategy
> = (paymentIntegrationService) =>
    new BigCommercePaymentsKlarnaPaymentStrategy(
        paymentIntegrationService,
        createBigCommercePaymentsIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createBigCommercePaymentsKlarnaPaymentStrategy, [
    { gateway: 'bigcommerce_payments_apms', id: 'klarna' },
]);
