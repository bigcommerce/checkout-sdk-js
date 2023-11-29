import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import TDOnlineMartPaymentStrategy from './td-online-mart-payment-strategy';
import TDOnlineMartScriptLoader from './td-online-mart-script-loader';

const createTDOnlineMartPaymentStrategy: PaymentStrategyFactory<TDOnlineMartPaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new TDOnlineMartPaymentStrategy(
        paymentIntegrationService,
        new TDOnlineMartScriptLoader(getScriptLoader()),
    );
};

export default toResolvableModule(createTDOnlineMartPaymentStrategy, [{ id: 'tdonlinemart' }]);
