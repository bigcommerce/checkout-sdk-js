import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalSdkScriptLoader,
    PaypalCommerceWalletService,
} from '@bigcommerce/checkout-sdk/paypal-utils';
import { WalletPaymentButtonStrategyFactory } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import PaypalCommerceWalletStrategy from './paypal-commerce-wallet-strategy';

const createPaypalCommerceWalletStrategy: WalletPaymentButtonStrategyFactory<
    PaypalCommerceWalletStrategy
> = (walletButtonIntegrationService) =>
    new PaypalCommerceWalletStrategy(
        new PaypalCommerceWalletService(
            walletButtonIntegrationService,
            createPayPalSdkScriptLoader(),
        ),
    );

export default toResolvableModule(createPaypalCommerceWalletStrategy, [
    { id: 'paypalcommercepaypal' },
]);
