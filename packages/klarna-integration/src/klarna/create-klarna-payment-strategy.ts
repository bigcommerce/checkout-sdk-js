import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import KlarnaPaymentStrategy from './klarna-payment-strategy';
import KlarnaScriptLoader from './klarna-script-loader';

const createKlarnaPaymentStrategy: PaymentStrategyFactory<KlarnaPaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new KlarnaPaymentStrategy(
        paymentIntegrationService,
        new KlarnaScriptLoader(getScriptLoader()),
    );
};

export default toResolvableModule(createKlarnaPaymentStrategy, [{ id: 'klarna' }]);
