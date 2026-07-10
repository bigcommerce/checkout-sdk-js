import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeHeadlessSDKVersionManager,
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreePaypalWalletService,
    BraintreeScriptLoader,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    WalletButtonIntegrationService,
    WalletPaymentButtonStrategyFactory,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import BraintreePaypalWalletStrategy from './braintree-paypal-wallet-strategy';

const createBraintreePaypalWalletStrategy: WalletPaymentButtonStrategyFactory<
    BraintreePaypalWalletStrategy
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

    return new BraintreePaypalWalletStrategy(
        new BraintreePaypalWalletService(
            walletButtonIntegrationService,
            braintreeIntegrationService,
        ),
        braintreeHostWindow,
    );
};

export default toResolvableModule(createBraintreePaypalWalletStrategy, [{ id: 'braintreepaypal' }]);
