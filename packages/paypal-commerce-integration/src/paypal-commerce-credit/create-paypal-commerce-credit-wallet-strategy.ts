import { getScriptLoader } from '@bigcommerce/script-loader';

import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { WalletPaymentButtonStrategyFactory } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import PayPalCommerceScriptLoader from '../paypal-commerce-script-loader';
import PaypalCommerceWalletService from '../paypal-commerce-wallet-service';

import PayPalCommerceCreditWalletStrategy from './paypal-commerce-credit-wallet-strategy';

const createPayPalCommerceCreditWalletStrategy: WalletPaymentButtonStrategyFactory<
    PayPalCommerceCreditWalletStrategy
> = (walletButtonIntegrationService) =>
    new PayPalCommerceCreditWalletStrategy(
        new PaypalCommerceWalletService(
            walletButtonIntegrationService,
            new PayPalCommerceScriptLoader(getScriptLoader()),
        ),
    );

export default toResolvableModule(createPayPalCommerceCreditWalletStrategy, [
    { id: 'paypalcommercepaypalcredit' },
]);
