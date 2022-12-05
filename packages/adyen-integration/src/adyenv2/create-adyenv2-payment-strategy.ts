import { getScriptLoader, getStylesheetLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import AdyenV2PaymentStrategy from './adyenv2-payment-strategy';
import AdyenV2ScriptLoader from './adyenv2-script-loader';

const createAdyenV2PaymentStrategy: PaymentStrategyFactory<AdyenV2PaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new AdyenV2PaymentStrategy(
        paymentIntegrationService,
        new AdyenV2ScriptLoader(getScriptLoader(), getStylesheetLoader()),
    );
};

export default toResolvableModule(createAdyenV2PaymentStrategy, [{ gateway: 'adyenv2' }]);
