import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BlueSnapDirectEcpPaymentStrategy from './bluesnap-direct-ecp-payment-strategy';

const createBlueSnapDirectEcpPaymentStrategy: PaymentStrategyFactory<
    BlueSnapDirectEcpPaymentStrategy
> = (paymentIntegrationService) => new BlueSnapDirectEcpPaymentStrategy(paymentIntegrationService);

export default toResolvableModule(createBlueSnapDirectEcpPaymentStrategy, [
    { id: 'ecp', gateway: 'bluesnapdirect' },
]);
