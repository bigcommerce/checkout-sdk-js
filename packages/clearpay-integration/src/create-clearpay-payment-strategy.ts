import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import ClearpayPaymentStrategy from './clearpay-payment-strategy';
import ClearpayScriptLoader from './clearpay-script-loader';

const createClearpayPaymentStrategy: PaymentStrategyFactory<ClearpayPaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new ClearpayPaymentStrategy(
        paymentIntegrationService,
        new ClearpayScriptLoader(getScriptLoader()),
    );
};

export default toResolvableModule(createClearpayPaymentStrategy, [
    { gateway: 'clearpay' },
    { id: 'clearpay' },
]);
