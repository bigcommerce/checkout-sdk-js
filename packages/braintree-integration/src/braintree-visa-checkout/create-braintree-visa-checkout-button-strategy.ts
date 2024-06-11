import { createFormPoster } from '@bigcommerce/form-poster';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeHostWindow,
    BraintreeScriptLoader,
    BraintreeSdk,
    VisaCheckoutHostWindow,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeVisaCheckoutButtonStrategy from './braintree-visa-checkout-button-strategy';
import VisaCheckoutScriptLoader from './visa-checkout-script-loader';

const createBraintreeVisaCheckoutButtonStrategy: CheckoutButtonStrategyFactory<
    BraintreeVisaCheckoutButtonStrategy
> = (paymentIntegrationService) => {
    const hostWindow: VisaCheckoutHostWindow & BraintreeHostWindow = window;
    const braintreeSdk = new BraintreeSdk(new BraintreeScriptLoader(getScriptLoader(), hostWindow));
    const visaCheckoutScriptLoader = new VisaCheckoutScriptLoader(getScriptLoader(), hostWindow);

    return new BraintreeVisaCheckoutButtonStrategy(
        paymentIntegrationService,
        createFormPoster(),
        braintreeSdk,
        visaCheckoutScriptLoader,
    );
};

export default toResolvableModule(createBraintreeVisaCheckoutButtonStrategy, [
    { id: 'braintreevisacheckout' },
]);
