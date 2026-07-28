import { getScriptLoader } from '@bigcommerce/script-loader';

import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { WalletPaymentButtonStrategyFactory } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import PayPalCommerceScriptLoader from '../paypal-commerce-script-loader';
import PaypalCommerceWalletService from '../paypal-commerce-wallet-service';

import PayPalCommerceVenmoWalletStrategy from './paypal-commerce-venmo-wallet-strategy';

const createPayPalCommerceVenmoWalletStrategy: WalletPaymentButtonStrategyFactory<
    PayPalCommerceVenmoWalletStrategy
> = (walletButtonIntegrationService) =>
    new PayPalCommerceVenmoWalletStrategy(
        new PaypalCommerceWalletService(
            walletButtonIntegrationService,
            new PayPalCommerceScriptLoader(getScriptLoader()),
        ),
    );

export default toResolvableModule(createPayPalCommerceVenmoWalletStrategy, [
    { id: 'paypalcommercevenmo' },
]);
