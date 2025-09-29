import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    StripeIntegrationService,
    StripeScriptLoader,
} from '@bigcommerce/checkout-sdk/stripe-utils';

import StripeUPEPaymentStrategy from './stripe-upe-payment-strategy';

const createStripeUPEPaymentStrategy: PaymentStrategyFactory<StripeUPEPaymentStrategy> = (
    paymentIntegrationService,
) => {
    const stripeScriptLoader = new StripeScriptLoader(getScriptLoader());

    return new StripeUPEPaymentStrategy(
        paymentIntegrationService,
        stripeScriptLoader,
        new StripeIntegrationService(paymentIntegrationService, stripeScriptLoader),
    );
};

export default toResolvableModule(createStripeUPEPaymentStrategy, [
    { gateway: 'stripeupe' },
    { gateway: 'stripeupe', id: 'klarna' },
]);
