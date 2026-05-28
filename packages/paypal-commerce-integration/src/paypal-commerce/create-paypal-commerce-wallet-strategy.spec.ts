import {
    createWalletButtonIntegrationService,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import createPayPalCommerceWalletStrategy from './create-paypal-commerce-wallet-strategy';
import PayPalCommerceWalletStrategy from './paypal-commerce-wallet-strategy';

describe('createPayPalCommerceWalletStrategy', () => {
    let walletButtonIntegrationService: WalletButtonIntegrationService;

    beforeEach(() => {
        walletButtonIntegrationService = createWalletButtonIntegrationService('/graphql');
    });

    it('creates an instance of PayPalCommerceWalletStrategy', () => {
        const strategy = createPayPalCommerceWalletStrategy(walletButtonIntegrationService);

        expect(strategy).toBeInstanceOf(PayPalCommerceWalletStrategy);
    });
});
