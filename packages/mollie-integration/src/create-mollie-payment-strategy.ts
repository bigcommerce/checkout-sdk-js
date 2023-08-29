import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import MolliePaymentStrategy from './mollie-payment-strategy';
import MollieScriptLoader from './mollie-script-loader';

const createMolliePaymentStrategy: PaymentStrategyFactory<MolliePaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new MolliePaymentStrategy(
        new MollieScriptLoader(getScriptLoader()),
        paymentIntegrationService,
    );
};

export default toResolvableModule(createMolliePaymentStrategy, [{ gateway: 'mollie' }]);
