import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import NetTermsPaymentStrategy from './net-terms-payment-strategy';

const createNetTermsPaymentStrategy: PaymentStrategyFactory<NetTermsPaymentStrategy> = (
    paymentIntegrationService,
) => new NetTermsPaymentStrategy(paymentIntegrationService);

export default toResolvableModule(createNetTermsPaymentStrategy, [
    { id: 'b2b.net_terms', type: 'PAYMENT_TYPE_OFFLINE' },
]);
