import { createRequestSender } from '@bigcommerce/request-sender';

import { createCheckoutStore } from '../checkout';
import { PaymentMethodActionCreator, PaymentMethodRequestSender } from '../payment';

import CheckoutButtonInitializer from './checkout-button-initializer';
import CheckoutButtonStrategyActionCreator from './checkout-button-strategy-action-creator';
import createCheckoutButtonRegistry from './create-checkout-button-registry';

export default function createCheckoutButtonInitializer(): CheckoutButtonInitializer {
    const store = createCheckoutStore();

    return new CheckoutButtonInitializer(
        store,
        new CheckoutButtonStrategyActionCreator(
            createCheckoutButtonRegistry(store),
            new PaymentMethodActionCreator(new PaymentMethodRequestSender(createRequestSender()))
        )
    );
}
