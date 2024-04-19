import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeIntegrationService,
    BraintreeScriptLoader,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import ApplePayButtonStrategy from './apple-pay-button-strategy';
import ApplePaySessionFactory from './apple-pay-session-factory';

const createApplePayButtonStrategy: CheckoutButtonStrategyFactory<ApplePayButtonStrategy> = (
    paymentIntegrationService,
) => {
    const { getHost } = paymentIntegrationService.getState();
    const hostWindow = window;

    return new ApplePayButtonStrategy(
        createRequestSender({ host: getHost() }),
        paymentIntegrationService,
        new ApplePaySessionFactory(),
        new BraintreeIntegrationService(
            new BraintreeScriptLoader(getScriptLoader(), hostWindow),
            hostWindow,
        ),
    );
};

export default toResolvableModule(createApplePayButtonStrategy, [{ id: 'applepay' }]);
