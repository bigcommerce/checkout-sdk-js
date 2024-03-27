import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeHostWindow,
    BraintreeScriptLoader,
    BraintreeSdk,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeAchPaymentStrategy from './braintree-ach-payment-strategy';

const createBraintreeAchPaymentStrategy: PaymentStrategyFactory<BraintreeAchPaymentStrategy> = (
    paymentIntegrationService,
) => {
    const braintreeHostWindow: BraintreeHostWindow = window;
    const braintreeSdk = new BraintreeSdk(
        new BraintreeScriptLoader(getScriptLoader(), braintreeHostWindow),
    );

    return new BraintreeAchPaymentStrategy(paymentIntegrationService, braintreeSdk);
};

export default toResolvableModule(createBraintreeAchPaymentStrategy, [{ id: 'braintreeach' }]);
