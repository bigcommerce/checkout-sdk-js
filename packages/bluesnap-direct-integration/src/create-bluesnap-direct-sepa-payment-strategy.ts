import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BlueSnapDirectSepaPaymentStrategy from './bluesnap-direct-sepa-payment-strategy';

const createBlueSnapDirectSepaPaymentStrategy: PaymentStrategyFactory<
    BlueSnapDirectSepaPaymentStrategy
> = (paymentIntegrationService) => new BlueSnapDirectSepaPaymentStrategy(paymentIntegrationService);

export default toResolvableModule(createBlueSnapDirectSepaPaymentStrategy, [
    { id: 'sepa_direct_debit', gateway: 'bluesnapdirect' },
]);
