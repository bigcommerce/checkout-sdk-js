import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BigCommercePaymentsInvoicesPaymentStrategy from './bigcommerce-payments-invoices-payment-strategy';

const createBigCommercePaymentsInvoicesPaymentStrategy: PaymentStrategyFactory<
    BigCommercePaymentsInvoicesPaymentStrategy
> = (paymentIntegrationService) =>
    new BigCommercePaymentsInvoicesPaymentStrategy(paymentIntegrationService);

export default toResolvableModule(createBigCommercePaymentsInvoicesPaymentStrategy, [
    { id: 'bigcommerce_payments_invoices' },
]);
