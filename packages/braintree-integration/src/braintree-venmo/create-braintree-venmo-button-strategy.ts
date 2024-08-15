import { createFormPoster } from '@bigcommerce/form-poster';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeHostWindow,
    BraintreeScriptLoader,
    BraintreeSdk,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeVenmoButtonStrategy from './braintree-venmo-button-strategy';

const createBraintreeVenmoButtonStrategy: CheckoutButtonStrategyFactory<
    BraintreeVenmoButtonStrategy
> = (paymentIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;
    const scriptLoader = getScriptLoader();
    const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, braintreeHostWindow);

    const braintreeSdk = new BraintreeSdk(braintreeScriptLoader);

    return new BraintreeVenmoButtonStrategy(
        paymentIntegrationService,
        createFormPoster(),
        braintreeSdk,
    );
};

export default toResolvableModule(createBraintreeVenmoButtonStrategy, [{ id: 'braintreevenmo' }]);
