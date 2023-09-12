import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreeScriptLoader,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeSepaPaymentStrategy from './braintree-sepa-payment-strategy';

const createBraintreeSepaPaymentStrategy: PaymentStrategyFactory<
    BraintreeSepaPaymentStrategy
> = (paymentIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;
    const braintreeIntegrationService = new BraintreeIntegrationService(
        new BraintreeScriptLoader(getScriptLoader(), braintreeHostWindow),
        braintreeHostWindow,
    );

    return new BraintreeSepaPaymentStrategy(paymentIntegrationService, braintreeIntegrationService);
};

export default toResolvableModule(createBraintreeSepaPaymentStrategy, [
    { id: 'braintreesepa' },
]);
