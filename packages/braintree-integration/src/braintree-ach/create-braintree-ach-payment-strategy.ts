import { createBraintreeSdk } from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeAchPaymentStrategy from './braintree-ach-payment-strategy';

const createBraintreeAchPaymentStrategy: PaymentStrategyFactory<BraintreeAchPaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new BraintreeAchPaymentStrategy(paymentIntegrationService, createBraintreeSdk());
};

export default toResolvableModule(createBraintreeAchPaymentStrategy, [{ id: 'braintreeach' }]);
