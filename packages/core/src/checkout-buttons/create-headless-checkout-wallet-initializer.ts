import { createRequestSender } from '@bigcommerce/request-sender';

import { createCheckoutStore } from '../checkout';
import { ConfigState } from '../config';
import * as defaultCheckoutHeadlessWalletStrategyFactories from '../generated/checkout-headless-wallet-strategies';
import { PaymentMethodActionCreator, PaymentMethodRequestSender } from '../payment';
import { createPaymentIntegrationService } from '../payment-integration';

import createCheckoutButtonStrategyRegistryV2 from './create-checkout-button-registry-v2';
import HeadlessCheckoutWalletInitializer from './headless-checkout-wallet-initializer';
import HeadlessCheckoutWalletInitializerOptions from './headless-checkout-wallet-initializer-options';
import HeadlessCheckoutWalletStrategyActionCreator from './headless-checkout-wallet-strategy-action-creator';

export default function createHeadlessCheckoutWalletInitializer(
    options?: HeadlessCheckoutWalletInitializerOptions,
): HeadlessCheckoutWalletInitializer {
    const { host, locale = 'en' } = options ?? {};

    const config: ConfigState = {
        meta: {
            host,
            locale,
        },
        errors: {},
        statuses: {},
    };

    const store = createCheckoutStore({ config });
    const requestSender = createRequestSender({ host });
    const paymentIntegrationService = createPaymentIntegrationService(store);
    const registryV2 = createCheckoutButtonStrategyRegistryV2(
        paymentIntegrationService,
        defaultCheckoutHeadlessWalletStrategyFactories,
    );

    return new HeadlessCheckoutWalletInitializer(
        store,
        new HeadlessCheckoutWalletStrategyActionCreator(
            registryV2,
            new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender)),
        ),
    );
}
