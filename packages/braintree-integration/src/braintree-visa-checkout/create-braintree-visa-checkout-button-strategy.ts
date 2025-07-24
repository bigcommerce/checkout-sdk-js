import { createFormPoster } from '@bigcommerce/form-poster';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeHostWindow,
    BraintreeScriptLoader,
    BraintreeSdk,
    BraintreeSDKVersionManager,
    VisaCheckoutHostWindow,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeVisaCheckoutButtonStrategy from './braintree-visa-checkout-button-strategy';

const createBraintreeVisaCheckoutButtonStrategy: CheckoutButtonStrategyFactory<
    BraintreeVisaCheckoutButtonStrategy
> = (paymentIntegrationService) => {
    const hostWindow: VisaCheckoutHostWindow & BraintreeHostWindow = window;
    const braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
    const braintreeSdk = new BraintreeSdk(
        new BraintreeScriptLoader(getScriptLoader(), hostWindow, braintreeSDKVersionManager),
    );

    return new BraintreeVisaCheckoutButtonStrategy(
        paymentIntegrationService,
        createFormPoster(),
        braintreeSdk,
    );
};

export default toResolvableModule(createBraintreeVisaCheckoutButtonStrategy, [
    { id: 'braintreevisacheckout' },
]);
