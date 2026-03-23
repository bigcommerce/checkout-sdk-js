import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import WorldpayAccessOpenBankingPaymentStrategy from './worldpayaccess-open-banking-payment-strategy';

const createWorldpayAccessOpenBankingPaymentStrategy: PaymentStrategyFactory<WorldpayAccessOpenBankingPaymentStrategy> =
    (paymentIntegrationService) =>
        new WorldpayAccessOpenBankingPaymentStrategy(paymentIntegrationService);

export default toResolvableModule(createWorldpayAccessOpenBankingPaymentStrategy, [
    { id: 'open_banking', gateway: 'worldpayaccess' },
]);
