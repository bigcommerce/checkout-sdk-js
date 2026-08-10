import { getScriptLoader } from '@bigcommerce/script-loader';

import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaypalCommerceWalletService } from '@bigcommerce/checkout-sdk/paypal-utils';
import { WalletPaymentButtonStrategyFactory } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import PayPalCommerceScriptLoader from '../paypal-commerce-script-loader';

import PaypalCommerceWalletStrategy from './paypal-commerce-wallet-strategy';

const createPaypalCommerceWalletStrategy: WalletPaymentButtonStrategyFactory<
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
