import { createAmazonPayV2PaymentProcessor } from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import AmazonPayV2PaymentStrategy from './amazon-pay-v2-payment-strategy';

const createAmazonPayV2PaymentStrategy: PaymentStrategyFactory<AmazonPayV2PaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new AmazonPayV2PaymentStrategy(
        paymentIntegrationService,
        createAmazonPayV2PaymentProcessor(),
    );
};

export default toResolvableModule(createAmazonPayV2PaymentStrategy, [{ id: 'amazonpay' }]);
