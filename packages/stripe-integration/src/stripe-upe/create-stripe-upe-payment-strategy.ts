import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import StripeUPEIntegrationService from './stripe-upe-integration-service';
import StripeUPEPaymentStrategy from './stripe-upe-payment-strategy';
import StripeUPEScriptLoader from './stripe-upe-script-loader';

const createStripeUPEPaymentStrategy: PaymentStrategyFactory<StripeUPEPaymentStrategy> = (
    paymentIntegrationService,
) => {
    const stripeScriptLoader = new StripeUPEScriptLoader(getScriptLoader());

    return new StripeUPEPaymentStrategy(
        paymentIntegrationService,
        stripeScriptLoader,
        new StripeUPEIntegrationService(paymentIntegrationService, stripeScriptLoader),
    );
};

export default toResolvableModule(createStripeUPEPaymentStrategy, [
    { gateway: 'stripeupe' },
    { gateway: 'stripeupe', id: 'klarna' },
]);
