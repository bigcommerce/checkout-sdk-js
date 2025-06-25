import { getScriptLoader } from '@bigcommerce/script-loader';

import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { WalletButtonStrategyFactory } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import PayPalCommerceScriptLoader from '../paypal-commerce-script-loader';
import PaypalCommerceWalletService from '../paypal-commerce-wallet-service';

import PaypalCommerceWalletStrategy from './paypal-commerce-wallet-strategy';

const createPaypalCommerceWalletStrategy: WalletButtonStrategyFactory<
    PaypalCommerceWalletStrategy
> = (walletButtonIntegrationService) =>
    new PaypalCommerceWalletStrategy(
        new PaypalCommerceWalletService(
            walletButtonIntegrationService,
            new PayPalCommerceScriptLoader(getScriptLoader()),
        ),
    );

export default toResolvableModule(createPaypalCommerceWalletStrategy, [
    { id: 'paypalcommercepaypal' },
]);
