import { createRequestSender } from '@bigcommerce/request-sender';

import { createCheckoutStore } from '../checkout';
import { PaymentMethodActionCreator, PaymentMethodRequestSender } from '../payment';

import CheckoutButtonInitializer from './checkout-button-initializer';
import CheckoutButtonInitializerOptions from './checkout-button-initializer-options';
import CheckoutButtonStrategyActionCreator from './checkout-button-strategy-action-creator';
import createCheckoutButtonRegistry from './create-checkout-button-registry';

/**
 * Creates an instance of `CheckoutButtonInitializer`.
 *
 * ```js
 * const initializer = createCheckoutButtonInitializer();
 *
 * initializer.initializeButton({
 *     methodId: 'braintreepaypal',
 *     braintreepaypal: {
 *         container: '#checkoutButton',
 *     },
 * });
 * ```
 *
 * Please note that `CheckoutButtonInitializer` is currently in an early stage
 * of development. Therefore the API is unstable and not ready for public
 * consumption.
 *
 * @alpha
 * @param options - A set of construction options.
 * @returns an instance of `CheckoutButtonInitializer`.
 */
export default function createCheckoutButtonInitializer(
    options?: CheckoutButtonInitializerOptions
): CheckoutButtonInitializer {
    const store = createCheckoutStore();
    const requestSender = createRequestSender({ host: options && options.host });

    return new CheckoutButtonInitializer(
        store,
        new CheckoutButtonStrategyActionCreator(
            createCheckoutButtonRegistry(store),
            new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender))
        )
    );
}
