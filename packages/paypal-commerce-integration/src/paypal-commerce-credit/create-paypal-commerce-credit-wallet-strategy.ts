import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalSdkScriptLoader,
    PaypalCommerceWalletService,
} from '@bigcommerce/checkout-sdk/paypal-utils';
import { WalletPaymentButtonStrategyFactory } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import PayPalCommerceCreditWalletStrategy from './paypal-commerce-credit-wallet-strategy';

const createPayPalCommerceCreditWalletStrategy: WalletPaymentButtonStrategyFactory<
    PayPalCommerceCreditWalletStrategy
> = (walletButtonIntegrationService) =>
    new PayPalCommerceCreditWalletStrategy(
        new PaypalCommerceWalletService(
            walletButtonIntegrationService,
            createPayPalSdkScriptLoader(),
        ),
    );

export default toResolvableModule(createPayPalCommerceCreditWalletStrategy, [
    { id: 'paypalcommercepaypalcredit' },
]);
