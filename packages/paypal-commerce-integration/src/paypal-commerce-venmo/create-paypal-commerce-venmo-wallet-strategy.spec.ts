import {
    createWalletButtonIntegrationService,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import createPayPalCommerceVenmoWalletStrategy from './create-paypal-commerce-venmo-wallet-strategy';
import PayPalCommerceVenmoWalletStrategy from './paypal-commerce-venmo-wallet-strategy';

describe('createPayPalCommerceVenmoWalletStrategy', () => {
    let walletButtonIntegrationService: WalletButtonIntegrationService;

    beforeEach(() => {
        walletButtonIntegrationService = createWalletButtonIntegrationService('/graphql');
    });

    it('creates an instance of PayPalCommerceVenmoWalletStrategy', () => {
        const strategy = createPayPalCommerceVenmoWalletStrategy(walletButtonIntegrationService);

        expect(strategy).toBeInstanceOf(PayPalCommerceVenmoWalletStrategy);
    });
});
