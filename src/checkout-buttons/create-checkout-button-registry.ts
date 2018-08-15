import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { BraintreeScriptLoader, BraintreeSDKCreator } from '../payment/strategies/braintree';
import { PaypalScriptLoader } from '../payment/strategies/paypal';

import { BraintreePaypalButtonStrategy, CheckoutButtonStrategy } from './strategies';

export default function createCheckoutButtonRegistry(store: CheckoutStore): Registry<CheckoutButtonStrategy> {
    const registry = new Registry<CheckoutButtonStrategy>();
    const requestSender = createRequestSender();
    const checkoutActionCreator = new CheckoutActionCreator(
        new CheckoutRequestSender(requestSender),
        new ConfigActionCreator(new ConfigRequestSender(requestSender))
    );

    registry.register('braintreepaypal', () =>
        new BraintreePaypalButtonStrategy(
            store,
            checkoutActionCreator,
            new BraintreeSDKCreator(new BraintreeScriptLoader(getScriptLoader())),
            new PaypalScriptLoader(getScriptLoader()),
            createFormPoster()
        )
    );

    registry.register('braintreepaypalcredit', () =>
        new BraintreePaypalButtonStrategy(
            store,
            checkoutActionCreator,
            new BraintreeSDKCreator(new BraintreeScriptLoader(getScriptLoader())),
            new PaypalScriptLoader(getScriptLoader()),
            createFormPoster(),
            true
        )
    );

    return registry;
}
