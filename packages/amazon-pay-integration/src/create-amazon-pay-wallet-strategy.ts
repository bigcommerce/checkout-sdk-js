import { createAmazonPayV2PaymentProcessor } from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { WalletPaymentButtonStrategyFactory } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import AmazonPayWalletStrategy from './amazon-pay-wallet-strategy';

// The factory receives `walletButtonIntegrationService` per the wallet-button contract,
// but Amazon Pay's headless legs use none of its GraphQL primitives, so it is not used.
const createAmazonPayWalletStrategy: WalletPaymentButtonStrategyFactory<
    AmazonPayWalletStrategy
> = () => new AmazonPayWalletStrategy(createAmazonPayV2PaymentProcessor());

export default toResolvableModule(createAmazonPayWalletStrategy, [{ id: 'amazonpayamazonpay' }]);
