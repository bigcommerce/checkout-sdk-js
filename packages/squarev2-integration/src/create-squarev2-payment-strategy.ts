import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategy,
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import SquareV2PaymentProcessor from './squarev2-payment-processor';
import SquareV2PaymentStrategy from './squarev2-payment-strategy';
import SquareV2ScriptLoader from './squarev2-script-loader';

const createSquareV2PaymentStrategy: PaymentStrategyFactory<PaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new SquareV2PaymentStrategy(
        paymentIntegrationService,
        new SquareV2PaymentProcessor(
            new SquareV2ScriptLoader(getScriptLoader()),
            paymentIntegrationService,
        ),
    );
};

export default toResolvableModule(createSquareV2PaymentStrategy, [{ id: 'squarev2' }]);
