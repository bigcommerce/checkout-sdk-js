import { createFormPoster } from '@bigcommerce/form-poster';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { PayPalSdkHelper } from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { WalletPaymentButtonStrategyFactory } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import createGooglePayScriptLoader from '../factories/create-google-pay-script-loader';
import GooglePayWalletService from '../google-pay-wallet-service';
import GooglePayWalletStrategy from '../google-pay-wallet-strategy';

import GooglePayBigCommercePaymentsWalletGateway from './google-pay-bigcommerce-payments-wallet-gateway';

const createGooglePayBigCommercePaymentsWalletStrategy: WalletPaymentButtonStrategyFactory<
    GooglePayWalletStrategy
> = (walletButtonIntegrationService) =>
    new GooglePayWalletStrategy(
        new GooglePayWalletService(
            walletButtonIntegrationService,
            createGooglePayScriptLoader(),
            new GooglePayBigCommercePaymentsWalletGateway(new PayPalSdkHelper(getScriptLoader())),
            createFormPoster(),
        ),
    );

export default toResolvableModule(createGooglePayBigCommercePaymentsWalletStrategy, [
    { id: 'bigcommerce_paymentsgooglepay' },
]);
