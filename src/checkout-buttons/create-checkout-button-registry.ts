import { createFormPoster } from '@bigcommerce/form-poster';
import { RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { BraintreeScriptLoader, BraintreeSDKCreator } from '../payment/strategies/braintree';
import { MasterpassScriptLoader } from '../payment/strategies/masterpass';
import { PaypalScriptLoader } from '../payment/strategies/paypal';

<<<<<<< HEAD
import { BraintreePaypalButtonStrategy, CheckoutButtonStrategy, MasterpassButtonStrategy } from './strategies';
=======
import { BraintreePaypalButtonStrategy, CheckoutButtonMethodType, CheckoutButtonStrategy } from './strategies';
>>>>>>> fix(checkout-button): CHECKOUT-3584 Allow rendering checkout buttons more than once

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

    registry.register(CheckoutButtonMethodType.BRAINTREE_PAYPAL, () =>
        new BraintreePaypalButtonStrategy(
            store,
            checkoutActionCreator,
            new BraintreeSDKCreator(new BraintreeScriptLoader(scriptLoader)),
            new PaypalScriptLoader(scriptLoader),
            createFormPoster()
        )
    );

    registry.register(CheckoutButtonMethodType.BRAINTREE_PAYPAL_CREDIT, () =>
        new BraintreePaypalButtonStrategy(
            store,
            checkoutActionCreator,
            new BraintreeSDKCreator(new BraintreeScriptLoader(scriptLoader)),
            new PaypalScriptLoader(scriptLoader),
            createFormPoster(),
            true
        )
    );

    registry.register('masterpass', () =>
        new MasterpassButtonStrategy(
            store,
            checkoutActionCreator,
            new MasterpassScriptLoader(scriptLoader)
        )
    );

    return registry;
}
