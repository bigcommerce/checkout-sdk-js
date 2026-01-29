import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    StripeIntegrationService,
    StripeScriptLoader,
} from '@bigcommerce/checkout-sdk/stripe-utils';

import StripeCSPaymentStrategy from './stripe-cs-payment-strategy';
import StripeCSScriptLoader from './stripe-cs-script-loader';

const createStripeCSPaymentStrategy: PaymentStrategyFactory<StripeCSPaymentStrategy> = (
    paymentIntegrationService,
) => {
    const stripeScriptLoader = new StripeCSScriptLoader(getScriptLoader());

    return new StripeCSPaymentStrategy(
        paymentIntegrationService,
        stripeScriptLoader,
        new StripeIntegrationService(paymentIntegrationService, stripeScriptLoader as unknown as StripeScriptLoader),
    );
};

export default toResolvableModule(createStripeCSPaymentStrategy, [
    { gateway: 'stripeocs', id: 'optimized_checkout' },
]);
