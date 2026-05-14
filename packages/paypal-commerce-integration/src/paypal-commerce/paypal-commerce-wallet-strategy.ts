import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { WalletButtonIntegrationService } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import { WithPayPalCommerceWalletInitializeOptions } from './paypal-commerce-wallet-initialize-options';

/**
 * PayPal Commerce Wallet Button Strategy stub for headless wallet button integration.
 *
 * This is an empty stub class at this stage. Concrete implementation will be
 * added in follow-up tickets.
 */
export default class PayPalCommerceWalletStrategy implements CheckoutButtonStrategy {
    constructor(private walletButtonIntegrationService: WalletButtonIntegrationService) {}

    getWalletButtonIntegrationService(): WalletButtonIntegrationService {
        return this.walletButtonIntegrationService;
    }

    async initialize(
        _options: CheckoutButtonInitializeOptions & WithPayPalCommerceWalletInitializeOptions,
    ): Promise<void> {
        return Promise.resolve();
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }
}
