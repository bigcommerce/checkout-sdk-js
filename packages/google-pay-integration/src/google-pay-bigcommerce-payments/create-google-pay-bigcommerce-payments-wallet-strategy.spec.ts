import { WalletButtonIntegrationService } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import GooglePayWalletStrategy from '../google-pay-wallet-strategy';

import createGooglePayBigCommercePaymentsWalletStrategy from './create-google-pay-bigcommerce-payments-wallet-strategy';

describe('createGooglePayBigCommercePaymentsWalletStrategy', () => {
    it('instantiates a Google Pay wallet strategy', () => {
        const strategy = createGooglePayBigCommercePaymentsWalletStrategy(
            {} as WalletButtonIntegrationService,
        );

        expect(strategy).toBeInstanceOf(GooglePayWalletStrategy);
    });

    it('resolves the BigCommerce Payments Google Pay method', () => {
        expect(createGooglePayBigCommercePaymentsWalletStrategy.resolveIds).toEqual([
            { id: 'bigcommerce_paymentsgooglepay' },
        ]);
    });
});
