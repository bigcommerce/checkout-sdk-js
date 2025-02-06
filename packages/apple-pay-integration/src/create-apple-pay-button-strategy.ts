import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import { BraintreeScriptLoader, BraintreeSdk } from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import ApplePayButtonStrategy from './apple-pay-button-strategy';
import ApplePayScriptLoader from './apple-pay-script-loader';
import ApplePaySessionFactory from './apple-pay-session-factory';

const createApplePayButtonStrategy: CheckoutButtonStrategyFactory<ApplePayButtonStrategy> = (
    paymentIntegrationService,
) => {
    const { getHost } = paymentIntegrationService.getState();

    return new ApplePayButtonStrategy(
        createRequestSender({ host: getHost() }),
        paymentIntegrationService,
        new ApplePaySessionFactory(),
        new BraintreeSdk(new BraintreeScriptLoader(getScriptLoader(), window)),
        new ApplePayScriptLoader(new ScriptLoader()),
    );
};

export default toResolvableModule(createApplePayButtonStrategy, [{ id: 'applepay' }]);
