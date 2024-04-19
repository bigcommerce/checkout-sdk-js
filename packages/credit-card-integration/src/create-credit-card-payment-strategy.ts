import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import CreditCardPaymentStrategy from './credit-card-payment-strategy';

const createCreditCardPaymentStrategy: PaymentStrategyFactory<CreditCardPaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new CreditCardPaymentStrategy(paymentIntegrationService);
};

export default toResolvableModule(createCreditCardPaymentStrategy, [{ default: true }]);
