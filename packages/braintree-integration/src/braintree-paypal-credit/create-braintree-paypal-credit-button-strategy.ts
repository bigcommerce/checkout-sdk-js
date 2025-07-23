import { createFormPoster } from '@bigcommerce/form-poster';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreeMessages,
    BraintreeScriptLoader,
    BraintreeSDKVersionManager,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreePaypalCreditButtonStrategy from './braintree-paypal-credit-button-strategy';

const createBraintreePaypalCreditButtonStrategy: CheckoutButtonStrategyFactory<
    BraintreePaypalCreditButtonStrategy
> = (paymentIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;
    const braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
    const braintreeIntegrationService = new BraintreeIntegrationService(
        new BraintreeScriptLoader(
            getScriptLoader(),
            braintreeHostWindow,
            braintreeSDKVersionManager,
        ),
        braintreeHostWindow,
    );
    const braintreeMessages = new BraintreeMessages(paymentIntegrationService);

    return new BraintreePaypalCreditButtonStrategy(
        paymentIntegrationService,
        createFormPoster(),
        braintreeIntegrationService,
        braintreeMessages,
        braintreeHostWindow,
    );
};

export default toResolvableModule(createBraintreePaypalCreditButtonStrategy, [
    { id: 'braintreepaypalcredit' },
]);
