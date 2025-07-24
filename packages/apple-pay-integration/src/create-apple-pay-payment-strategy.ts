import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeScriptLoader,
    BraintreeSdk,
    BraintreeSDKVersionManager,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import ApplePayPaymentStrategy from './apple-pay-payment-strategy';
import ApplePaySessionFactory from './apple-pay-session-factory';

const createApplePayPaymentStrategy: PaymentStrategyFactory<ApplePayPaymentStrategy> = (
    paymentIntegrationService,
) => {
    const { getHost } = paymentIntegrationService.getState();
    const braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);

    return new ApplePayPaymentStrategy(
        createRequestSender({ host: getHost() }),
        paymentIntegrationService,
        new ApplePaySessionFactory(),
        new BraintreeSdk(
            new BraintreeScriptLoader(getScriptLoader(), window, braintreeSDKVersionManager),
        ),
    );
};

export default toResolvableModule(createApplePayPaymentStrategy, [{ id: 'applepay' }]);
