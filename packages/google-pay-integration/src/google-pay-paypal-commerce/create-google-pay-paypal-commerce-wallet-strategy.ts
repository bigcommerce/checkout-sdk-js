import { createFormPoster } from '@bigcommerce/form-poster';

import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { createPayPalSdkScriptLoader } from '@bigcommerce/checkout-sdk/paypal-utils';
import { WalletPaymentButtonStrategyFactory } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import createGooglePayScriptLoader from '../factories/create-google-pay-script-loader';
import GooglePayWalletService from '../google-pay-wallet-service';
import GooglePayWalletStrategy from '../google-pay-wallet-strategy';

import GooglePayPayPalCommerceWalletGateway from './google-pay-paypal-commerce-wallet-gateway';

const createGooglePayPayPalCommerceWalletStrategy: WalletPaymentButtonStrategyFactory<
    GooglePayWalletStrategy
> = (walletButtonIntegrationService) =>
    new GooglePayWalletStrategy(
        new GooglePayWalletService(
            walletButtonIntegrationService,
            createGooglePayScriptLoader(),
            new GooglePayPayPalCommerceWalletGateway(createPayPalSdkScriptLoader()),
            createFormPoster(),
        ),
    );

export default toResolvableModule(createGooglePayPayPalCommerceWalletStrategy, [
    { id: 'paypalcommercegooglepay' },
]);
