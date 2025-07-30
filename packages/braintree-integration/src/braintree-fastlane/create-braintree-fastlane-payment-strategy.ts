import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreeScriptLoader,
    BraintreeSdk,
    BraintreeSDKVersionManager,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeFastlanePaymentStrategy from './braintree-fastlane-payment-strategy';
import BraintreeFastlaneUtils from './braintree-fastlane-utils';

const createBraintreeFastlanePaymentStrategy: PaymentStrategyFactory<
    BraintreeFastlanePaymentStrategy
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

    const braintreeFastlaneUtils = new BraintreeFastlaneUtils(
        paymentIntegrationService,
        braintreeIntegrationService,
    );

    const braintreeScriptLoader = new BraintreeScriptLoader(
        getScriptLoader(),
        braintreeHostWindow,
        braintreeSDKVersionManager,
    );

    const braintreeSdk = new BraintreeSdk(braintreeScriptLoader);

    return new BraintreeFastlanePaymentStrategy(
        paymentIntegrationService,
        braintreeFastlaneUtils,
        braintreeSdk,
    );
};

export default toResolvableModule(createBraintreeFastlanePaymentStrategy, [
    { id: 'braintreeacceleratedcheckout' },
]);
