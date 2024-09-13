import { createAmazonPayV2PaymentProcessor } from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import AmazonPayV2CustomerStrategy from './amazon-pay-v2-customer-strategy';

const createAmazonPayV2CustomerStrategy: CustomerStrategyFactory<AmazonPayV2CustomerStrategy> = (
    paymentIntegrationService,
) => {
    return new AmazonPayV2CustomerStrategy(
        paymentIntegrationService,
        createAmazonPayV2PaymentProcessor(),
    );
};

export default toResolvableModule(createAmazonPayV2CustomerStrategy, [{ id: 'amazonpay' }]);
