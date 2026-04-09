import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import CybersourceUnifiedCheckoutClient from './cybersource-unified-checkout-client';
import CybersourceUnifiedCheckoutScriptLoader from './cybersource-unified-checkout-script-loader';
import CyberSourceV2PaymentStrategy from './cybersourcev2-payment-strategy';

const createCyberSourceV2PaymentStrategy: PaymentStrategyFactory<CyberSourceV2PaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new CyberSourceV2PaymentStrategy(
        paymentIntegrationService,
        new CybersourceUnifiedCheckoutClient(
            new CybersourceUnifiedCheckoutScriptLoader(getScriptLoader()),
        ),
    );
};

export default toResolvableModule(createCyberSourceV2PaymentStrategy, [
    { id: 'cybersourcev2' },
    { id: 'bnz' },
]);
