import { getScriptLoader } from '@bigcommerce/script-loader';

import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { WalletPaymentButtonStrategyFactory } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import BigCommercePaymentsScriptLoader from '../bigcommerce-payments-script-loader';
import BigCommercePaymentsWalletService from '../bigcommerce-payments-wallet-service';

import BigCommercePaymentsWalletStrategy from './bigcommerce-payments-wallet-strategy';

const createBigCommercePaymentsWalletStrategy: WalletPaymentButtonStrategyFactory<
    BigCommercePaymentsWalletStrategy
> = (walletButtonIntegrationService) =>
    new BigCommercePaymentsWalletStrategy(
        new BigCommercePaymentsWalletService(
            walletButtonIntegrationService,
            new BigCommercePaymentsScriptLoader(getScriptLoader()),
        ),
    );

export default toResolvableModule(createBigCommercePaymentsWalletStrategy, [
    { id: 'bigcommerce_paymentspaypal' },
]);
