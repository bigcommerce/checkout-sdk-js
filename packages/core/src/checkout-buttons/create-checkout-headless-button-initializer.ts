import { createRequestSender } from '@bigcommerce/request-sender';

import { createCheckoutStore } from '../checkout';
import { ConfigState } from '../config';
import { PaymentMethodActionCreator, PaymentMethodRequestSender } from '../payment';
import { createPaymentIntegrationService } from '../payment-integration';

import CheckoutButtonInitializerOptions from './checkout-button-initializer-options';
import CheckoutHeadlessButtonInitializer from './checkout-headless-button-initializer';
import CheckoutHeadlessButtonStrategyActionCreator from './checkout-headless-button-strategy-action-creator';
import createCheckoutHeadlessButtonRegistryV2 from './create-checkout-headless-button-registry-v2';

export default function createCheckoutHeadlessButtonInitializer(
    options?: CheckoutButtonInitializerOptions,
): CheckoutHeadlessButtonInitializer {
    const { host, locale = 'en', storefrontJwtToken, siteLink } = options ?? {};

    const config: ConfigState = {
        meta: {
            host,
            locale,
            storefrontJwtToken,
            siteLink,
        },
        errors: {},
        statuses: {},
    };

    const store = createCheckoutStore({ config });
    const requestSender = createRequestSender({ host });
    const paymentIntegrationService = createPaymentIntegrationService(store);
    const registryV2 = createCheckoutHeadlessButtonRegistryV2(paymentIntegrationService);

    return new CheckoutHeadlessButtonInitializer(
        store,
        new CheckoutHeadlessButtonStrategyActionCreator(
            registryV2,
            new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender)),
        ),
    );
}
