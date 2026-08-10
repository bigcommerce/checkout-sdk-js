import { getScriptLoader } from '@bigcommerce/script-loader';

import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaypalCommerceWalletService } from '@bigcommerce/checkout-sdk/paypal-utils';
import { WalletPaymentButtonStrategyFactory } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import BigCommercePaymentsScriptLoader from '../bigcommerce-payments-script-loader';

import BigCommercePaymentsWalletStrategy from './bigcommerce-payments-wallet-strategy';

const createBigCommercePaymentsWalletStrategy: WalletPaymentButtonStrategyFactory<
    BigCommercePaymentsWalletStrategy
> = (walletButtonIntegrationService) =>
    new BigCommercePaymentsWalletStrategy(
        new PaypalCommerceWalletService(
            walletButtonIntegrationService,
            new BigCommercePaymentsScriptLoader(getScriptLoader()),
            'BigcommercePaymentWalletIntentData',
        ),
    );

export default toResolvableModule(createBigCommercePaymentsWalletStrategy, [
    { id: 'bigcommerce_paymentspaypal' },
]);
