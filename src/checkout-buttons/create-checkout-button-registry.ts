import { createFormPoster } from '@bigcommerce/form-poster';
import { RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { BraintreeScriptLoader, BraintreeSDKCreator } from '../payment/strategies/braintree';

import { createGooglePayPaymentProcessor } from '../payment/strategies/googlepay';
import { MasterpassScriptLoader } from '../payment/strategies/masterpass';
import { PaypalScriptLoader } from '../payment/strategies/paypal';

import {
    BraintreePaypalButtonStrategy,
    CheckoutButtonMethodType,
    CheckoutButtonStrategy,
    GooglePayBraintreeButtonStrategy,
    MasterpassButtonStrategy
} from './strategies';

export default function createCheckoutButtonRegistry(
    store: CheckoutStore,
    requestSender: RequestSender
): Registry<CheckoutButtonStrategy, CheckoutButtonMethodType> {
    const registry = new Registry<CheckoutButtonStrategy, CheckoutButtonMethodType>();
    const scriptLoader = getScriptLoader();
    const checkoutActionCreator = new CheckoutActionCreator(
        new CheckoutRequestSender(requestSender),
        new ConfigActionCreator(new ConfigRequestSender(requestSender))
    );
    const formPoster = createFormPoster();

    registry.register(CheckoutButtonMethodType.BRAINTREE_PAYPAL, () =>
        new BraintreePaypalButtonStrategy(
            store,
            checkoutActionCreator,
            new BraintreeSDKCreator(new BraintreeScriptLoader(scriptLoader)),
            new PaypalScriptLoader(scriptLoader),
            formPoster
        )
    );

    registry.register(CheckoutButtonMethodType.BRAINTREE_PAYPAL_CREDIT, () =>
        new BraintreePaypalButtonStrategy(
            store,
            checkoutActionCreator,
            new BraintreeSDKCreator(new BraintreeScriptLoader(scriptLoader)),
            new PaypalScriptLoader(scriptLoader),
            formPoster,
            true
        )
    );

    registry.register(CheckoutButtonMethodType.MASTERPASS, () =>
        new MasterpassButtonStrategy(
            store,
            checkoutActionCreator,
            new MasterpassScriptLoader(scriptLoader)
        ));

    registry.register(CheckoutButtonMethodType.GOOGLEPAY_BRAINTREE, () =>
        new GooglePayBraintreeButtonStrategy(
            store,
            formPoster,
            checkoutActionCreator,
            createGooglePayPaymentProcessor(store)
        )
    );

    return registry;
}
