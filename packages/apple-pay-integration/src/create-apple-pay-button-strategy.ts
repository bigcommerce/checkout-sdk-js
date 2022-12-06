import { createRequestSender } from '@bigcommerce/request-sender';

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

    return new ApplePayButtonStrategy(
        createRequestSender({ host: getHost() }),
        paymentIntegrationService,
        new ApplePaySessionFactory(),
    );
};

export default toResolvableModule(createApplePayButtonStrategy, [{ id: 'applepay' }]);
