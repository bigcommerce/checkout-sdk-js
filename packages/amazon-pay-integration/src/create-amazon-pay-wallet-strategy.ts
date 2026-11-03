import { createAmazonPayV2PaymentProcessor } from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { WalletPaymentButtonStrategyFactory } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import AmazonPayWalletStrategy from './amazon-pay-wallet-strategy';

const createAmazonPayWalletStrategy: WalletPaymentButtonStrategyFactory<
    AmazonPayWalletStrategy
> = () => new AmazonPayWalletStrategy(createAmazonPayV2PaymentProcessor());

export default toResolvableModule(createAmazonPayWalletStrategy, [{ id: 'amazonpayamazonpay' }]);
