import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import MonerisPaymentStrategy from './moneris-payment-strategy';

const createMonerisPaymentStrategy: PaymentStrategyFactory<MonerisPaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new MonerisPaymentStrategy(paymentIntegrationService);
};

export default toResolvableModule(createMonerisPaymentStrategy, [{ id: 'moneris' }]);
