import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import StripeV3PaymentStrategy from './stripev3-payment-strategy';
import StripeV3ScriptLoader from './stripev3-script-loader';

const createStripeV3PaymentStrategy: PaymentStrategyFactory<any> = (paymentIntegrationService) => {
    return new StripeV3PaymentStrategy(
        paymentIntegrationService,
        new StripeV3ScriptLoader(getScriptLoader()),
    );
};

export default toResolvableModule(createStripeV3PaymentStrategy, [{ gateway: 'stripev3' }]);
