import { RequestSender } from '@bigcommerce/request-sender';
import { ScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeScriptLoader,
    BraintreeSDKVersionManager,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeSDKCreator from './braintree-sdk-creator';
import BraintreeVisaCheckoutPaymentProcessor from './braintree-visacheckout-payment-processor';

export default function createBraintreeVisaCheckoutPaymentProcessor(
    scriptLoader: ScriptLoader,
    requestSender: RequestSender,
    paymentIntegrationService: PaymentIntegrationService,
) {
    const braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
    const braintreeScriptLoader = new BraintreeScriptLoader(
        scriptLoader,
        window,
        braintreeSDKVersionManager,
    );
    const braintreeSDKCreator = new BraintreeSDKCreator(braintreeScriptLoader);

    return new BraintreeVisaCheckoutPaymentProcessor(braintreeSDKCreator, requestSender);
}
