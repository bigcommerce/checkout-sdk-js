import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreePaymentProcessor,
    BraintreeScriptLoader,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import BraintreeCreditCardPaymentStrategy from './braintree-credit-card-payment-strategy';
import { BraintreeHostedForm } from '@bigcommerce/checkout-sdk/braintree-integration';

const createBraintreeCreditCardPaymentStrategy: PaymentStrategyFactory<
    BraintreeCreditCardPaymentStrategy
> = (paymentIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;
    const braintreeIntegrationService = new BraintreeIntegrationService(
        new BraintreeScriptLoader(getScriptLoader(), braintreeHostWindow),
        braintreeHostWindow,
    );
    const braintreeHostedForm = new BraintreeHostedForm(
        braintreeIntegrationService,
        new BraintreeScriptLoader(getScriptLoader(), braintreeHostWindow),
    );
    const braintreePaymentProcessor = new BraintreePaymentProcessor(
        braintreeIntegrationService,
        braintreeHostedForm,
    );

    return new BraintreeCreditCardPaymentStrategy(
        paymentIntegrationService,
        braintreePaymentProcessor,
        braintreeIntegrationService
    );
};

export default toResolvableModule(createBraintreeCreditCardPaymentStrategy, [
    { id: 'braintree' },
]);
