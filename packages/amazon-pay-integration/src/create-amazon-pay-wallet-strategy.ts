import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    AmazonPayV2ScriptLoader,
    AmazonPayWalletService,
} from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { WalletPaymentButtonStrategyFactory } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import AmazonPayWalletStrategy from './amazon-pay-wallet-strategy';

// The factory receives `walletButtonIntegrationService` per the wallet-button contract,
// but Amazon Pay's headless legs use none of its GraphQL primitives (see
// AmazonPayWalletService docs), so it is intentionally not forwarded.
const createAmazonPayWalletStrategy: WalletPaymentButtonStrategyFactory<
    AmazonPayWalletStrategy
> = () =>
    new AmazonPayWalletStrategy(
        new AmazonPayWalletService(new AmazonPayV2ScriptLoader(getScriptLoader())),
    );

export default toResolvableModule(createAmazonPayWalletStrategy, [{ id: 'amazonpayamazonpay' }]);
