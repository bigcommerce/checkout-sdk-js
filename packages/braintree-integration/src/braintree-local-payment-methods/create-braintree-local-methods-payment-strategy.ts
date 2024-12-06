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
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import BraintreeLocalMethodsPaymentStrategy from './braintree-local-methods-payment-strategy';

const createBraintreeLocalMethodsPaymentStrategy: PaymentStrategyFactory<
    BraintreeLocalMethodsPaymentStrategy
> = (paymentIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;
    const braintreeSdk = new BraintreeSdk(
        new BraintreeScriptLoader(getScriptLoader(), braintreeHostWindow),
    );

    return new BraintreeLocalMethodsPaymentStrategy(
        paymentIntegrationService,
        braintreeSdk,
        new LoadingIndicator({ styles: { backgroundColor: 'black' } }),
    );
};

export default toResolvableModule(createBraintreeLocalMethodsPaymentStrategy, [
    { gateway: 'braintreelocalmethods' },
]);
