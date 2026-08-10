import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalSdkScriptLoader,
    PaypalCommerceWalletService,
} from '@bigcommerce/checkout-sdk/paypal-utils';
import { WalletPaymentButtonStrategyFactory } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import BigCommercePaymentsWalletStrategy from './bigcommerce-payments-wallet-strategy';

const createBigCommercePaymentsWalletStrategy: WalletPaymentButtonStrategyFactory<
    BigCommercePaymentsWalletStrategy
> = (walletButtonIntegrationService) =>
    new BigCommercePaymentsWalletStrategy(
        new PaypalCommerceWalletService(
            walletButtonIntegrationService,
            createPayPalSdkScriptLoader(),
            'BigcommercePaymentWalletIntentData',
        ),
    );

export default toResolvableModule(createBigCommercePaymentsWalletStrategy, [
    { id: 'bigcommerce_paymentspaypal' },
]);
