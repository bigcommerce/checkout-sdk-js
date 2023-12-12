import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BlueSnapDirectIdealPaymentStrategy from './bluesnap-direct-ideal-payment-strategy';

const createBlueSnapDirectIdealPaymentStrategy: PaymentStrategyFactory<
    BlueSnapDirectIdealPaymentStrategy
> = (paymentIntegrationService) =>
    new BlueSnapDirectIdealPaymentStrategy(paymentIntegrationService);

export default toResolvableModule(createBlueSnapDirectIdealPaymentStrategy, [
    // { id: 'ideal', gateway: 'bluesnapdirect' },
    { id: 'moneybookers', gateway: 'bluesnapdirect' },
]);
