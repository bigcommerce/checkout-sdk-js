import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BlueSnapDirectAPMPaymentStrategy from './bluesnap-direct-apm-payment-strategy';

const createBlueSnapDirectAPMPaymentStrategy: PaymentStrategyFactory<
    BlueSnapDirectAPMPaymentStrategy
> = (paymentIntegrationService) => new BlueSnapDirectAPMPaymentStrategy(paymentIntegrationService);

export default toResolvableModule(createBlueSnapDirectAPMPaymentStrategy, [
    { gateway: 'bluesnapdirect' },
]);
