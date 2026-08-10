import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalSdkScriptLoader,
    PaypalCommerceWalletService,
} from '@bigcommerce/checkout-sdk/paypal-utils';
import { WalletPaymentButtonStrategyFactory } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import PayPalCommerceVenmoWalletStrategy from './paypal-commerce-venmo-wallet-strategy';

const createPayPalCommerceVenmoWalletStrategy: WalletPaymentButtonStrategyFactory<
    PayPalCommerceVenmoWalletStrategy
> = (walletButtonIntegrationService) =>
    new PayPalCommerceVenmoWalletStrategy(
        new PaypalCommerceWalletService(
            walletButtonIntegrationService,
            createPayPalSdkScriptLoader(),
        ),
    );

export default toResolvableModule(createPayPalCommerceVenmoWalletStrategy, [
    { id: 'paypalcommercevenmo' },
]);
