import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeHeadlessSDKVersionManager,
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreeScriptLoader,
    BraintreeVenmoWalletService,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    WalletButtonIntegrationService,
    WalletPaymentButtonStrategyFactory,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import BraintreeVenmoWalletStrategy from './braintree-venmo-wallet-strategy';

const createBraintreeVenmoWalletStrategy: WalletPaymentButtonStrategyFactory<
    BraintreeVenmoWalletStrategy
> = (walletButtonIntegrationService: WalletButtonIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;

    const braintreeIntegrationService = new BraintreeIntegrationService(
        new BraintreeScriptLoader(
            getScriptLoader(),
            braintreeHostWindow,
            new BraintreeHeadlessSDKVersionManager(),
        ),
        braintreeHostWindow,
    );

    return new BraintreeVenmoWalletStrategy(
        new BraintreeVenmoWalletService(
            walletButtonIntegrationService,
            braintreeIntegrationService,
        ),
    );
};

export default toResolvableModule(createBraintreeVenmoWalletStrategy, [{ id: 'braintreevenmo' }]);
