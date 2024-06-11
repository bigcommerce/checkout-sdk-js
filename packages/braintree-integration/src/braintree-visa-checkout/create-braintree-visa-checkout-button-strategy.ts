import { createFormPoster } from '@bigcommerce/form-poster';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreeScriptLoader,
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
    const braintreeIntegrationService = new BraintreeIntegrationService(
        new BraintreeScriptLoader(getScriptLoader(), hostWindow),
        hostWindow,
    );
    const visaCheckoutScriptLoader = new VisaCheckoutScriptLoader(getScriptLoader(), hostWindow);

    return new BraintreeVisaCheckoutButtonStrategy(
        paymentIntegrationService,
        createFormPoster(),
        braintreeIntegrationService,
        visaCheckoutScriptLoader,
    );
};

export default toResolvableModule(createBraintreeVisaCheckoutButtonStrategy, [
    { id: 'braintreevisacheckout' },
]);
