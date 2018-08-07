import { createRequestSender } from '@bigcommerce/request-sender';

import { createCheckoutClient, createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender } from '../checkout';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { PaymentMethodActionCreator } from '../payment';

import CheckoutButtonInitializer from './checkout-button-initializer';
import CheckoutButtonStrategyActionCreator from './checkout-button-strategy-action-creator';
import createCheckoutButtonRegistry from './create-checkout-button-registry';

export default function createCheckoutButtonInitializer(): CheckoutButtonInitializer {
    const store = createCheckoutStore();
    const requestSender = createRequestSender();

    return new CheckoutButtonInitializer(
        store,
        new CheckoutButtonStrategyActionCreator(
            createCheckoutButtonRegistry(store),
            new CheckoutActionCreator(
                new CheckoutRequestSender(requestSender),
                new ConfigActionCreator(new ConfigRequestSender(requestSender))
            ),
            new PaymentMethodActionCreator(createCheckoutClient())
        )
    );
}
