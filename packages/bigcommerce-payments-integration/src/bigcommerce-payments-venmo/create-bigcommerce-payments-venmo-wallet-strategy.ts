import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalSdkScriptLoader,
    PaypalCommerceWalletService,
} from '@bigcommerce/checkout-sdk/paypal-utils';
import { WalletPaymentButtonStrategyFactory } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import BigCommercePaymentsVenmoWalletStrategy from './bigcommerce-payments-venmo-wallet-strategy';

const createBigCommercePaymentsVenmoWalletStrategy: WalletPaymentButtonStrategyFactory<
    BigCommercePaymentsVenmoWalletStrategy
> = (walletButtonIntegrationService) =>
    new BigCommercePaymentsVenmoWalletStrategy(
        new PaypalCommerceWalletService(
            walletButtonIntegrationService,
            createPayPalSdkScriptLoader(),
            'BigcommercePaymentWalletIntentData',
        ),
    );

export default toResolvableModule(createBigCommercePaymentsVenmoWalletStrategy, [
    { id: 'bigcommerce_paymentsvenmo' },
]);
