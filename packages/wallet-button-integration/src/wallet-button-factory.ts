import { CheckoutButtonStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';

import WalletButtonIntegrationService from './wallet-button-integration-service';

type WalletPaymentButtonStrategyFactory<TStrategy extends CheckoutButtonStrategy> = (
    walletPaymentButtonIntegrationService: WalletButtonIntegrationService,
) => TStrategy;

export default WalletPaymentButtonStrategyFactory;
