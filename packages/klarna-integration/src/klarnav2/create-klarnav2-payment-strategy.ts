import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import KlarnaV2PaymentStrategy from './klarnav2-payment-strategy';
import KlarnaV2ScriptLoader from './klarnav2-script-loader';
import KlarnaV2TokenUpdater from './klarnav2-token-updater';

const createKlarnaV2PaymentStrategy: PaymentStrategyFactory<KlarnaV2PaymentStrategy> = (
    paymentIntegrationService,
) => {
    const { getHost } = paymentIntegrationService.getState();
    const requestSender = createRequestSender({ host: getHost() });

    return new KlarnaV2PaymentStrategy(
        paymentIntegrationService,
        new KlarnaV2ScriptLoader(getScriptLoader()),
        new KlarnaV2TokenUpdater(requestSender),
    );
};

export default toResolvableModule(createKlarnaV2PaymentStrategy, [{ gateway: 'klarna' }]);
