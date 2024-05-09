import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CardinalClient,
    CardinalScriptLoader,
    CardinalThreeDSecureFlowV2,
} from '@bigcommerce/checkout-sdk/cardinal-integration';
import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import CyberSourceV2PaymentStrategy from './cybersourcev2-payment-strategy';

const createCyberSourceV2PaymentStrategy: PaymentStrategyFactory<CyberSourceV2PaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new CyberSourceV2PaymentStrategy(
        paymentIntegrationService,
        new CardinalThreeDSecureFlowV2(
            paymentIntegrationService,
            new CardinalClient(new CardinalScriptLoader(getScriptLoader())),
        ),
    );
};

export default toResolvableModule(createCyberSourceV2PaymentStrategy, [{ id: 'cybersourcev2' }]);
