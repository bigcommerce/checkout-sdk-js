import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import OffsitePaymentStrategy from './offsite-payment-strategy';

const createOffsitePaymentStrategy: PaymentStrategyFactory<OffsitePaymentStrategy> = (
    paymentIntegrationService,
) => new OffsitePaymentStrategy(paymentIntegrationService);

export default toResolvableModule(createOffsitePaymentStrategy, [{ type: 'PAYMENT_TYPE_HOSTED' }]);
