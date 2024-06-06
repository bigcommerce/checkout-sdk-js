import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CardinalClient,
    CardinalScriptLoader,
    CardinalThreeDSecureFlow,
} from '@bigcommerce/checkout-sdk/cardinal-integration';
import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import CyberSourcePaymentStrategy from './cybersource-payment-strategy';

const createCyberSourcePaymentStrategy: PaymentStrategyFactory<CyberSourcePaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new CyberSourcePaymentStrategy(
        paymentIntegrationService,
        new CardinalThreeDSecureFlow(
            paymentIntegrationService,
            new CardinalClient(new CardinalScriptLoader(getScriptLoader())),
        ),
    );
};

export default toResolvableModule(createCyberSourcePaymentStrategy, [{ id: 'cybersource' }]);
