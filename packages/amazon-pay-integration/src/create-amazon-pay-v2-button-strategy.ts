import { createRequestSender } from '@bigcommerce/request-sender';

import { createAmazonPayV2PaymentProcessor } from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import AmazonPayV2ButtonStrategy from './amazon-pay-v2-button-strategy';
import AmazonPayV2RequestSender from './amazon-pay-v2-request-sender';

const createAmazonPayV2ButtonStrategy: CheckoutButtonStrategyFactory<AmazonPayV2ButtonStrategy> = (
    paymentIntegrationService,
) => {
    const requestSender = createRequestSender();
    const amazonPayV2RequestSender = new AmazonPayV2RequestSender(requestSender);
    const amazonPayV2PaymentProcessor = createAmazonPayV2PaymentProcessor();

    return new AmazonPayV2ButtonStrategy(
        paymentIntegrationService,
        amazonPayV2PaymentProcessor,
        amazonPayV2RequestSender,
    );
};

export default toResolvableModule(createAmazonPayV2ButtonStrategy, [{ id: 'amazonpay' }]);
