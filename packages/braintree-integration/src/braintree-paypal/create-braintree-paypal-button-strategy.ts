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

import BraintreePaypalButtonStrategy from './braintree-paypal-button-strategy';

const createBraintreePaypalButtonStrategy: CheckoutButtonStrategyFactory<
    BraintreePaypalButtonStrategy
> = (paymentIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;
    const braintreeIntegrationService = new BraintreeIntegrationService(
        new BraintreeScriptLoader(getScriptLoader(), braintreeHostWindow),
        braintreeHostWindow,
    );

    return new BraintreePaypalButtonStrategy(
        paymentIntegrationService,
        createFormPoster(),
        braintreeIntegrationService,
        braintreeHostWindow,
    );
};

export default toResolvableModule(createBraintreePaypalButtonStrategy, [{ id: 'braintreepaypal' }]);
