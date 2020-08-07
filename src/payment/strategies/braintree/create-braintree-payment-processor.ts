import { ScriptLoader } from '@bigcommerce/script-loader';

import { Overlay } from '../../../common/overlay';

import BraintreeHostedForm from './braintree-hosted-form';
import BraintreePaymentProcessor from './braintree-payment-processor';
import BraintreeScriptLoader from './braintree-script-loader';
import BraintreeSDKCreator from './braintree-sdk-creator';

export default function createBraintreePaymentProcessor(scriptLoader: ScriptLoader) {
    const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader);
    const braintreeSDKCreator = new BraintreeSDKCreator(braintreeScriptLoader);
    const braintreeHostedForm = new BraintreeHostedForm(braintreeSDKCreator);
    const overlay = new Overlay();

    return new BraintreePaymentProcessor(
        braintreeSDKCreator,
        braintreeHostedForm,
        overlay
    );
}
