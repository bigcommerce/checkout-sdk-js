import { createHeadlessWalletButtonIntegrationService } from '@bigcommerce/checkout-sdk/headless-wallet-button-integration';

import * as defaultCheckoutHeadlessWalletStrategyFactories from '../generated/checkout-headless-wallet-strategies';
import { createHeadlessButtonStore } from '../headless-buttons';

import createHeadlessWalletButtonStrategyRegistry from './create-headless-wallet-button-strategy-registry';
import HeadlessCheckoutWalletInitializer from './headless-checkout-wallet-initializer';
import HeadlessCheckoutWalletStrategyActionCreator from './headless-checkout-wallet-strategy-action-creator';

export default function createHeadlessCheckoutWalletInitializer(): HeadlessCheckoutWalletInitializer {
    const store = createHeadlessButtonStore();

    const headlessWalletButtonIntegrationService = createHeadlessWalletButtonIntegrationService();
    const registryV2 = createHeadlessWalletButtonStrategyRegistry(
        headlessWalletButtonIntegrationService,
        defaultCheckoutHeadlessWalletStrategyFactories,
    );

    return new HeadlessCheckoutWalletInitializer(
        store,
        new HeadlessCheckoutWalletStrategyActionCreator(registryV2),
    );
}
