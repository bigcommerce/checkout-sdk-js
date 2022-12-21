import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import LegacyPaymentStrategy from './legacy-payment-strategy';

const createLegacyPaymentStrategy: PaymentStrategyFactory<LegacyPaymentStrategy> = (
    paymentIntegrationService,
) => new LegacyPaymentStrategy(paymentIntegrationService);

export default toResolvableModule(createLegacyPaymentStrategy, [{ id: 'testgateway' }]);
