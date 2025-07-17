import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreeMessages,
    BraintreeScriptLoader,
    BraintreeSDKVersionManager,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator, Overlay } from '@bigcommerce/checkout-sdk/ui';

import { LOADING_INDICATOR_STYLES } from '../braintree-paypal-constants';

import BraintreePaypalPaymentStrategy from './braintree-paypal-payment-strategy';

const createBraintreePaypalPaymentStrategy: PaymentStrategyFactory<
    BraintreePaypalPaymentStrategy
> = (paymentIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;
    const overlay = new Overlay();

    const braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
    const braintreeIntegrationService = new BraintreeIntegrationService(
        new BraintreeScriptLoader(
            getScriptLoader(),
            braintreeHostWindow,
            braintreeSDKVersionManager,
        ),
        braintreeHostWindow,
        overlay,
    );
    const braintreeMessages = new BraintreeMessages(paymentIntegrationService);

    return new BraintreePaypalPaymentStrategy(
        paymentIntegrationService,
        braintreeIntegrationService,
        braintreeMessages,
        new LoadingIndicator({
            containerStyles: LOADING_INDICATOR_STYLES,
        }),
    );
};

export default toResolvableModule(createBraintreePaypalPaymentStrategy, [
    { id: 'braintreepaypal' },
    { id: 'braintreepaypalcredit' },
]);
