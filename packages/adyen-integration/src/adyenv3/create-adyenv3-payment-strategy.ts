import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader, getStylesheetLoader } from '@bigcommerce/script-loader';

import { AdyenV3ScriptLoader } from '@bigcommerce/checkout-sdk/adyen-utils';
import {
    PaymentStrategyFactory,
    SurchargeActionHandler,
    SurchargeRequestSender,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import AdyenV3PaymentStrategy from './adyenv3-payment-strategy';

const createAdyenV3PaymentStrategy: PaymentStrategyFactory<AdyenV3PaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new AdyenV3PaymentStrategy(
        paymentIntegrationService,
        new AdyenV3ScriptLoader(getScriptLoader(), getStylesheetLoader()),
        new SurchargeActionHandler(
            paymentIntegrationService,
            new SurchargeRequestSender(createRequestSender()),
        ),
    );
};

export default toResolvableModule(createAdyenV3PaymentStrategy, [{ gateway: 'adyenv3' }]);
