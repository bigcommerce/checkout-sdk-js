import { createFormPoster } from '@bigcommerce/form-poster';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { BraintreeScriptLoader, BraintreeSDKCreator } from '../payment/strategies/braintree';
import { PaypalScriptLoader } from '../payment/strategies/paypal';

import { BraintreePaypalButtonStrategy, CheckoutButtonStrategy } from './strategies';

export default function createCheckoutButtonRegistry(store: CheckoutStore): Registry<CheckoutButtonStrategy> {
    const registry = new Registry<CheckoutButtonStrategy>();

    registry.register('braintreepaypal', () =>
        new BraintreePaypalButtonStrategy(
            store,
            new BraintreeSDKCreator(new BraintreeScriptLoader(getScriptLoader())),
            new PaypalScriptLoader(getScriptLoader()),
            createFormPoster()
        )
    );

    registry.register('braintreepaypalcredit', () =>
        new BraintreePaypalButtonStrategy(
            store,
            new BraintreeSDKCreator(new BraintreeScriptLoader(getScriptLoader())),
            new PaypalScriptLoader(getScriptLoader()),
            createFormPoster(),
            true
        )
    );

    return registry;
}
