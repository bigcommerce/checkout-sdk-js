import { WalletButtonIntegrationService } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import GooglePayWalletStrategy from '../google-pay-wallet-strategy';

import createGooglePayPayPalCommerceWalletStrategy from './create-google-pay-paypal-commerce-wallet-strategy';

describe('createGooglePayPayPalCommerceWalletStrategy', () => {
    it('instantiates a Google Pay wallet strategy', () => {
        const strategy = createGooglePayPayPalCommerceWalletStrategy(
            {} as WalletButtonIntegrationService,
        );

        expect(strategy).toBeInstanceOf(GooglePayWalletStrategy);
    });

    it('resolves the PayPal Commerce Google Pay method', () => {
        expect(createGooglePayPayPalCommerceWalletStrategy.resolveIds).toEqual([
            { id: 'paypalcommercegooglepay' },
        ]);
    });
});
