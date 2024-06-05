import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import { createCheckoutStore } from '../checkout';
import { ConfigState } from '../config';
import { PaymentMethodActionCreator, PaymentMethodRequestSender } from '../payment';
import { createPaymentIntegrationService } from '../payment-integration';

import CheckoutButtonInitializer from './checkout-button-initializer';
import CheckoutButtonInitializerOptions from './checkout-button-initializer-options';
import CheckoutButtonStrategyActionCreator from './checkout-button-strategy-action-creator';
import createCheckoutButtonRegistry from './create-checkout-button-registry';
import createCheckoutButtonRegistryV2 from './create-checkout-button-registry-v2';

/**
 * Creates an instance of `CheckoutButtonInitializer`.
 *
 * @remarks
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
 * @alpha
 * Please note that `CheckoutButtonInitializer` is currently in an early stage
 * of development. Therefore the API is unstable and not ready for public
 * consumption.
 *
 * @param options - A set of construction options.
 * @returns an instance of `CheckoutButtonInitializer`.
 */
export default function createCheckoutButtonInitializer(
    options?: CheckoutButtonInitializerOptions,
): CheckoutButtonInitializer {
    const { host, locale = 'en' } = options ?? {};

    const config: ConfigState = {
        meta: {
            host: options?.host,
            locale: options?.locale,
        },
        errors: {},
        statuses: {},
    };

    const store = createCheckoutStore({ config });
    const requestSender = createRequestSender({ host });
    const formPoster = createFormPoster({ host });
    const paymentIntegrationService = createPaymentIntegrationService(store);
    const registryV2 = createCheckoutButtonRegistryV2(paymentIntegrationService);

    return new CheckoutButtonInitializer(
        store,
        new CheckoutButtonStrategyActionCreator(
            createCheckoutButtonRegistry(store, requestSender, formPoster, locale, host),
            registryV2,
            new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender)),
        ),
    );
}
