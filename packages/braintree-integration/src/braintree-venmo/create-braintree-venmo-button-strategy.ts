import { createFormPoster } from '@bigcommerce/form-poster';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreeScriptLoader,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { Overlay } from '@bigcommerce/checkout-sdk/ui';

import BraintreeVenmoButtonStrategy from './braintree-venmo-button-strategy';

const createBraintreeVenmoButtonStrategy: CheckoutButtonStrategyFactory<
    BraintreeVenmoButtonStrategy
> = (paymentIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;
    const overlay = new Overlay();

    const braintreeIntegrationService = new BraintreeIntegrationService(
        new BraintreeScriptLoader(getScriptLoader(), braintreeHostWindow),
        braintreeHostWindow,
        overlay,
    );

    return new BraintreeVenmoButtonStrategy(
        paymentIntegrationService,
        createFormPoster(),
        braintreeIntegrationService,
    );
};

export default toResolvableModule(createBraintreeVenmoButtonStrategy, [{ id: 'braintreevenmo' }]);
