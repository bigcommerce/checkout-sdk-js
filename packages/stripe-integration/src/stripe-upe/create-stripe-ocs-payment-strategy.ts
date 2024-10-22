import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import StripeOCSPaymentStrategy from './stripe-ocs-payment-strategy';
import StripeUPEIntegrationService from './stripe-upe-integration-service';
import StripeUPEScriptLoader from './stripe-upe-script-loader';

const createStripeOCSPaymentStrategy: PaymentStrategyFactory<StripeOCSPaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new StripeOCSPaymentStrategy(
        paymentIntegrationService,
        new StripeUPEScriptLoader(getScriptLoader()),
        new StripeUPEIntegrationService(paymentIntegrationService),
    );
};

export default toResolvableModule(createStripeOCSPaymentStrategy, [
    { gateway: 'stripeupe', id: 'stripe_ocs' },
]);
