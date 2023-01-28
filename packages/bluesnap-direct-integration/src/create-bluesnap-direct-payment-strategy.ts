import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BlueSnapDirectCreditCardPaymentStrategy from './bluesnap-direct-credit-card-payment-strategy';

const createBlueSnapDirectCreditCardPaymentStrategy: PaymentStrategyFactory<
    BlueSnapDirectCreditCardPaymentStrategy
> = (paymentIntegrationService) =>
    new BlueSnapDirectCreditCardPaymentStrategy(paymentIntegrationService);

export default toResolvableModule(createBlueSnapDirectCreditCardPaymentStrategy, [
    { id: 'CC', gateway: 'bluesnapdirect' },
]);
