import { getScriptLoader, getStylesheetLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import AdyenV3PaymentStrategy from './adyenv3-payment-strategy';
import AdyenV3ScriptLoader from './adyenv3-script-loader';

const createAdyenV3PaymentStrategy: PaymentStrategyFactory<AdyenV3PaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new AdyenV3PaymentStrategy(
        paymentIntegrationService,
        new AdyenV3ScriptLoader(getScriptLoader(), getStylesheetLoader()),
    );
};

export default toResolvableModule(createAdyenV3PaymentStrategy, [{ gateway: 'adyenv3' }]);
