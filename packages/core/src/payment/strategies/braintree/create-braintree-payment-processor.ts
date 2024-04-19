import { ScriptLoader } from '@bigcommerce/script-loader';

import { BraintreeScriptLoader } from '@bigcommerce/checkout-sdk/braintree-utils';

import BraintreeHostedForm from './braintree-hosted-form';
import BraintreePaymentProcessor from './braintree-payment-processor';
import BraintreeSDKCreator from './braintree-sdk-creator';

export default function createBraintreePaymentProcessor(scriptLoader: ScriptLoader) {
    const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, window);
    const braintreeSDKCreator = new BraintreeSDKCreator(braintreeScriptLoader);
    const braintreeHostedForm = new BraintreeHostedForm(braintreeSDKCreator);

    return new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm);
}
