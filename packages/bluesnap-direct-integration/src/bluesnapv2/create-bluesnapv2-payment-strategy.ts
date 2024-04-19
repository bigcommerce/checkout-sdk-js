import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BlueSnapV2PaymentStrategy from './bluesnapv2-payment-strategy';

const createBluesnapV2PaymentStrategy: PaymentStrategyFactory<BlueSnapV2PaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new BlueSnapV2PaymentStrategy(paymentIntegrationService);
};

export default toResolvableModule(createBluesnapV2PaymentStrategy, [{ gateway: 'bluesnapv2' }]);
