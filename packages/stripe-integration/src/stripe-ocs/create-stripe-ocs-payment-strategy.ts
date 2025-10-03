import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    StripeIntegrationService,
    StripeScriptLoader,
} from '@bigcommerce/checkout-sdk/stripe-utils';

import StripeOCSPaymentStrategy from './stripe-ocs-payment-strategy';

const createStripeOCSPaymentStrategy: PaymentStrategyFactory<StripeOCSPaymentStrategy> = (
    paymentIntegrationService,
) => {
    const stripeScriptLoader = new StripeScriptLoader(getScriptLoader());

    return new StripeOCSPaymentStrategy(
        paymentIntegrationService,
        stripeScriptLoader,
        new StripeIntegrationService(paymentIntegrationService, stripeScriptLoader),
    );
};

export default toResolvableModule(createStripeOCSPaymentStrategy, [
    { gateway: 'stripeocs', id: 'optimized_checkout' },
]);
