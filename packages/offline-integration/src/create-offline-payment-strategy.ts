import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import OfflinePaymentStrategy from './offline-payment-strategy';

const createOfflinePaymentStrategy: PaymentStrategyFactory<OfflinePaymentStrategy> = (
    paymentIntegrationService,
) => new OfflinePaymentStrategy(paymentIntegrationService);

export default toResolvableModule(createOfflinePaymentStrategy, [{ type: 'PAYMENT_TYPE_OFFLINE' }]);
