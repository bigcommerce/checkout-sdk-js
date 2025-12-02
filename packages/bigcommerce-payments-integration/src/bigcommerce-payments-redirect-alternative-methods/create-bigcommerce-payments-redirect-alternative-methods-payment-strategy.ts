import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createBigCommercePaymentsIntegrationService from '../create-bigcommerce-payments-integration-service';

import BigCommercePaymentsRedirectAlternativeMethodsPaymentStrategy from './bigcomemrce-payments-redirect-alternative-methods-payment-strategy';

const createBigCommercePaymentsRedirectAlternativeMethodsPaymentStrategy: PaymentStrategyFactory<
    BigCommercePaymentsRedirectAlternativeMethodsPaymentStrategy
> = (paymentIntegrationService) =>
    new BigCommercePaymentsRedirectAlternativeMethodsPaymentStrategy(
        paymentIntegrationService,
        createBigCommercePaymentsIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(
    createBigCommercePaymentsRedirectAlternativeMethodsPaymentStrategy,
    [
        { gateway: 'bigcommerce_payments_apms', id: 'klarna' },
        { gateway: 'bigcommerce_payments_apms', id: 'afterpay' },
    ],
);
