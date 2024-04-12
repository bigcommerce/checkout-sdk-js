import { createBraintreeSdk } from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import BraintreeLocalMethodsPaymentStrategy from './braintree-local-methods-payment-strategy';

const createBraintreeLocalMethodsPaymentStrategy: PaymentStrategyFactory<
    BraintreeLocalMethodsPaymentStrategy
> = (paymentIntegrationService) => {
    return new BraintreeLocalMethodsPaymentStrategy(
        paymentIntegrationService,
        createBraintreeSdk(),
        new LoadingIndicator({ styles: { backgroundColor: 'black' } }),
    );
};

export default toResolvableModule(createBraintreeLocalMethodsPaymentStrategy, [
    { gateway: 'braintreelocalmethods' },
]);
