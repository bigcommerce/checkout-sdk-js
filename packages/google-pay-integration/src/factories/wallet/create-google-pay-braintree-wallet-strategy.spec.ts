import {
    createWalletButtonIntegrationService,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import GooglePayWalletStrategy from '../../google-pay-wallet-strategy';

import createGooglePayBraintreeWalletStrategy from './create-google-pay-braintree-wallet-strategy';

describe('createGooglePayBraintreeWalletStrategy', () => {
    let walletButtonIntegrationService: WalletButtonIntegrationService;

    beforeEach(() => {
        walletButtonIntegrationService = createWalletButtonIntegrationService('/graphql');
    });

    it('instantiates google pay braintree wallet strategy', () => {
        const strategy = createGooglePayBraintreeWalletStrategy(walletButtonIntegrationService);

        expect(strategy).toBeInstanceOf(GooglePayWalletStrategy);
    });
});
