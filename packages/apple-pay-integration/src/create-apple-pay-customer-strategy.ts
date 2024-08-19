import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { BraintreeScriptLoader, BraintreeSdk } from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import ApplePayCustomerStrategy from './apple-pay-customer-strategy';
import ApplePaySessionFactory from './apple-pay-session-factory';

const createApplePayCustomerStrategy: CustomerStrategyFactory<ApplePayCustomerStrategy> = (
    paymentIntegrationService,
) => {
    const { getHost } = paymentIntegrationService.getState();

    return new ApplePayCustomerStrategy(
        createRequestSender({ host: getHost() }),
        paymentIntegrationService,
        new ApplePaySessionFactory(),
        new BraintreeSdk(new BraintreeScriptLoader(getScriptLoader(), window)),
    );
};

export default toResolvableModule(createApplePayCustomerStrategy, [{ id: 'applepay' }]);
