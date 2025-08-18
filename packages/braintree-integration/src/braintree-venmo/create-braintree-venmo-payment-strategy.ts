import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import BraintreeVenmoPaymentStrategy from './braintree-venmo-payment-strategy';
import {
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreeScriptLoader,
    BraintreeSDKVersionManager,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import { getScriptLoader } from '@bigcommerce/script-loader';

const createBraintreeVenmoPaymentStrategy: CheckoutButtonStrategyFactory<
    BraintreeVenmoPaymentStrategy
> = (paymentIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;
    const scriptLoader = getScriptLoader();
    const braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
    const braintreeScriptLoader = new BraintreeScriptLoader(
        scriptLoader,
        braintreeHostWindow,
        braintreeSDKVersionManager,
    );
    const braintreeIntegrationService = new BraintreeIntegrationService(
        braintreeScriptLoader,
        braintreeHostWindow,
    );

    return new BraintreeVenmoPaymentStrategy(
        paymentIntegrationService,
        braintreeIntegrationService,
    );
};

export default toResolvableModule(createBraintreeVenmoPaymentStrategy, [{ id: 'braintreevenmo' }]);
