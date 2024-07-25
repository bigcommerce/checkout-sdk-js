import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import StripeUPEPaymentStrategy from './stripe-upe-payment-strategy';
import StripeUPEScriptLoader from './stripe-upe-script-loader';

const createStripeUPEPaymentStrategy: PaymentStrategyFactory<StripeUPEPaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new StripeUPEPaymentStrategy(
        paymentIntegrationService,
        new StripeUPEScriptLoader(getScriptLoader()),
    );
};

export default toResolvableModule(createStripeUPEPaymentStrategy, [
    { gateway: 'stripeupe' },
    { gateway: 'stripeupe', id: 'klarna' },
]);
