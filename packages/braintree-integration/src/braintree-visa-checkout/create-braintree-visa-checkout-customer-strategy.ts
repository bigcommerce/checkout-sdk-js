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
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeVisaCheckoutCustomerStrategy from './braintree-visa-checkout-customer-strategy';

const createBraintreeVisaCheckoutCustomerStrategy: CustomerStrategyFactory<
    BraintreeVisaCheckoutCustomerStrategy
> = (paymentIntegrationService) => {
    const hostWindow: VisaCheckoutHostWindow & BraintreeHostWindow = window;
    const braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
    const braintreeSdk = new BraintreeSdk(
        new BraintreeScriptLoader(getScriptLoader(), hostWindow, braintreeSDKVersionManager),
    );

    return new BraintreeVisaCheckoutCustomerStrategy(
        paymentIntegrationService,
        createFormPoster(),
        braintreeSdk,
    );
};

export default toResolvableModule(createBraintreeVisaCheckoutCustomerStrategy, [
    { id: 'braintreevisacheckout' },
]);
