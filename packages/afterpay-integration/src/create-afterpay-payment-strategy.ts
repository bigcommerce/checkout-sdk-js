import { createScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import AfterpayPaymentStrategy from './afterpay-payment-strategy';
import AfterpayScriptLoader from './afterpay-script-loader';

const createAfterpayPaymentStrategy: PaymentStrategyFactory<AfterpayPaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new AfterpayPaymentStrategy(
        paymentIntegrationService,
        new AfterpayScriptLoader(createScriptLoader()),
    );
};

export default toResolvableModule(createAfterpayPaymentStrategy, [{ gateway: 'afterpay' }]);
