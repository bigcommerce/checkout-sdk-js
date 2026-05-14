import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    WalletButtonIntegrationService,
    WalletPaymentButtonStrategyFactory,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import PayPalCommerceWalletStrategy from './paypal-commerce-wallet-strategy';

const createPayPalCommerceWalletStrategy: WalletPaymentButtonStrategyFactory<
    PayPalCommerceWalletStrategy
> = (walletButtonIntegrationService: WalletButtonIntegrationService) => {
    return new PayPalCommerceWalletStrategy(walletButtonIntegrationService);
};

export default toResolvableModule(createPayPalCommerceWalletStrategy, [
    { id: 'paypalcommercepaypal' },
]);
