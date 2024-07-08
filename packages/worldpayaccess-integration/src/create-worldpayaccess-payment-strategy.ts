import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import WorldpayAccessPaymetStrategy from './worldpayaccess-payment-strategy';

const createWorldpayAccessPaymentStrategy: PaymentStrategyFactory<WorldpayAccessPaymetStrategy> = (
    paymentIntegrationService,
) => {
    return new WorldpayAccessPaymetStrategy(paymentIntegrationService);
};

export default toResolvableModule(createWorldpayAccessPaymentStrategy, [{ id: 'worldpayaccess' }]);
