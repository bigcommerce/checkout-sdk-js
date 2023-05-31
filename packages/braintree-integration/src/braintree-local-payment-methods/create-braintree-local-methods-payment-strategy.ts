import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeLocalMethodsPaymentStrategy from './braintree-local-methods-payment-strategy';
import { BraintreeHostWindow } from '../braintree';
import BraintreeIntegrationService from '../braintree-integration-service';
import BraintreeScriptLoader from '../braintree-script-loader';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

const createBraintreeLocalMethodsPaymentStrategy: PaymentStrategyFactory<
    BraintreeLocalMethodsPaymentStrategy
> = (paymentIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;
    const braintreeIntegrationService = new BraintreeIntegrationService(
        new BraintreeScriptLoader(getScriptLoader(), braintreeHostWindow),
        braintreeHostWindow,
    );

    return new BraintreeLocalMethodsPaymentStrategy(
        paymentIntegrationService,
        braintreeIntegrationService,
        new LoadingIndicator({ styles: { backgroundColor: 'black' } }),
    );
};

export default toResolvableModule(createBraintreeLocalMethodsPaymentStrategy, [
    { gateway: 'braintreelocalmethods' },
]);
