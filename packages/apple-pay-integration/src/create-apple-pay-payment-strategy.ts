import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import ApplePayPaymentStrategy from './apple-pay-payment-strategy';
import ApplePayScriptLoader from './apple-pay-script-loader';
import ApplePaySessionFactory from './apple-pay-session-factory';

const createApplePayPaymentStrategy: PaymentStrategyFactory<ApplePayPaymentStrategy> = (
    paymentIntegrationService,
) => {
    const { getHost } = paymentIntegrationService.getState();
    const applePayScriptLoader = new ApplePayScriptLoader(getScriptLoader(), window);

    return new ApplePayPaymentStrategy(
        createRequestSender({ host: getHost() }),
        paymentIntegrationService,
        new ApplePaySessionFactory(),
        applePayScriptLoader,
    );
};

export default toResolvableModule(createApplePayPaymentStrategy, [{ id: 'applepay' }]);
