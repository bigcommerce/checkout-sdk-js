import { ScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeScriptLoader,
    BraintreeSDKVersionManager,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreePaymentProcessor from './braintree-payment-processor';
import BraintreeSDKCreator from './braintree-sdk-creator';

export default function createBraintreePaymentProcessor(
    scriptLoader: ScriptLoader,
    paymentIntegrationService: PaymentIntegrationService,
) {
    const braintreeScriptLoader = new BraintreeScriptLoader(
        scriptLoader,
        window,
        new BraintreeSDKVersionManager(paymentIntegrationService),
    );
    const braintreeSDKCreator = new BraintreeSDKCreator(braintreeScriptLoader);

    return new BraintreePaymentProcessor(braintreeSDKCreator);
}
