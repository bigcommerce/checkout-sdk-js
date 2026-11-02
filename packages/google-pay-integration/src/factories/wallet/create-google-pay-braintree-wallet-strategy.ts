import { createFormPoster } from '@bigcommerce/form-poster';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeHeadlessSDKVersionManager,
    BraintreeHostWindow,
    BraintreeScriptLoader,
    BraintreeSdk,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    WalletButtonIntegrationService,
    WalletPaymentButtonStrategyFactory,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import GooglePayBraintreeWalletGateway from '../../gateways/google-pay-braintree-wallet-gateway';
import GooglePayWalletService from '../../google-pay-wallet-service';
import GooglePayWalletStrategy from '../../google-pay-wallet-strategy';
import createGooglePayScriptLoader from '../create-google-pay-script-loader';

const createGooglePayBraintreeWalletStrategy: WalletPaymentButtonStrategyFactory<
    GooglePayWalletStrategy
> = (walletButtonIntegrationService: WalletButtonIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;

    const braintreeSdk = new BraintreeSdk(
        new BraintreeScriptLoader(
            getScriptLoader(),
            braintreeHostWindow,
            new BraintreeHeadlessSDKVersionManager(),
        ),
    );

    return new GooglePayWalletStrategy(
        new GooglePayWalletService(
            walletButtonIntegrationService,
            createGooglePayScriptLoader(),
            new GooglePayBraintreeWalletGateway(braintreeSdk),
            createFormPoster(),
        ),
    );
};

export default toResolvableModule(createGooglePayBraintreeWalletStrategy, [
    { id: 'braintreegooglepay' },
]);
