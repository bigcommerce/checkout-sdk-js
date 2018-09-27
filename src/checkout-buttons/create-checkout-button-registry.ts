import { createFormPoster } from '@bigcommerce/form-poster';
import { RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { BraintreeScriptLoader, BraintreeSDKCreator } from '../payment/strategies/braintree';
import { MasterpassScriptLoader } from '../payment/strategies/masterpass';
import { PaypalScriptLoader } from '../payment/strategies/paypal';

import { BraintreePaypalButtonStrategy, CheckoutButtonStrategy, MasterpassButtonStrategy } from './strategies';

export default function createCheckoutButtonRegistry(
    store: CheckoutStore,
    requestSender: RequestSender
): Registry<CheckoutButtonStrategy> {
    const registry = new Registry<CheckoutButtonStrategy>();
    const scriptLoader = getScriptLoader();
    const checkoutActionCreator = new CheckoutActionCreator(
        new CheckoutRequestSender(requestSender),
        new ConfigActionCreator(new ConfigRequestSender(requestSender))
    );

    registry.register('braintreepaypal', () =>
        new BraintreePaypalButtonStrategy(
            store,
            checkoutActionCreator,
            new BraintreeSDKCreator(new BraintreeScriptLoader(scriptLoader)),
            new PaypalScriptLoader(scriptLoader),
            createFormPoster()
        )
    );

    registry.register('braintreepaypalcredit', () =>
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
