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

const createStripeCSPaymentStrategy: PaymentStrategyFactory<StripeCSPaymentStrategy> = (
    paymentIntegrationService,
) => {
    const stripeScriptLoader = new StripeScriptLoader(getScriptLoader());

    return new StripeCSPaymentStrategy(
        paymentIntegrationService,
        stripeScriptLoader,
        new StripeIntegrationService(paymentIntegrationService, stripeScriptLoader),
    );
};

export default toResolvableModule(createStripeCSPaymentStrategy, [
    { gateway: 'stripeocs', id: 'checkout_session' },
]);
