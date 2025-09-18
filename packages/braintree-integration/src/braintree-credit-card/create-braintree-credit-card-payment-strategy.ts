import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreeScriptLoader,
    BraintreeSDKVersionManager,
} from '@bigcommerce/checkout-sdk/braintree-utils';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeCreditCardPaymentStrategy from './braintree-credit-card-payment-strategy';
import BraintreeHostedForm from '../braintree-hosted-form/braintree-hosted-form';

const createBraintreeCreditCardPaymentStrategy: PaymentStrategyFactory<
    BraintreeCreditCardPaymentStrategy
> = (paymentIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;

    const braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);

    const braintreeScriptLoader = new BraintreeScriptLoader(
        getScriptLoader(),
        braintreeHostWindow,
        braintreeSDKVersionManager,
    );

    const braintreeIntegrationService = new BraintreeIntegrationService(
        braintreeScriptLoader,
        braintreeHostWindow,
    );

    const braintreeHostedForm = new BraintreeHostedForm(
        braintreeScriptLoader,
        braintreeSDKVersionManager,
    );

    return new BraintreeCreditCardPaymentStrategy(
        paymentIntegrationService,
        braintreeIntegrationService,
        braintreeHostedForm,
    );
};

export default toResolvableModule(createBraintreeCreditCardPaymentStrategy, [{ id: 'braintree' }]);
