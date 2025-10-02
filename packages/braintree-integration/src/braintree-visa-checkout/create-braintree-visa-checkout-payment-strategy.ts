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
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeVisaCheckoutPaymentStrategy from './braintree-visa-checkout-payment-strategy';

const createBraintreeVisaCheckoutPaymentStrategy: PaymentStrategyFactory<
    BraintreeVisaCheckoutPaymentStrategy
> = (paymentIntegrationService) => {
    const hostWindow: VisaCheckoutHostWindow & BraintreeHostWindow = window;
    const braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
    const braintreeSdk = new BraintreeSdk(
        new BraintreeScriptLoader(getScriptLoader(), hostWindow, braintreeSDKVersionManager),
    );

    return new BraintreeVisaCheckoutPaymentStrategy(
        paymentIntegrationService,
        createFormPoster(),
        braintreeSdk,
    );
};

export default toResolvableModule(createBraintreeVisaCheckoutPaymentStrategy, [
    { id: 'braintreevisacheckout' },
]);
