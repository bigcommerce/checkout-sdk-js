import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BRAINTREE_SDK_DEFAULT_VERSION,
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreeScriptLoader,
    BraintreeSDKVersionManager,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    WalletButtonIntegrationService,
    WalletPaymentButtonStrategyFactory,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import BraintreePaypalWalletService from './braintree-paypal-wallet-service';
import BraintreePaypalWalletStrategy from './braintree-paypal-wallet-strategy';

const createBraintreePaypalWalletStrategy: WalletPaymentButtonStrategyFactory<
    BraintreePaypalWalletStrategy
> = (walletButtonIntegrationService: WalletButtonIntegrationService) => {
    const braintreeHostWindow: BraintreeHostWindow = window;
    // TODO: Remove the hardcoded SDK version and add store state to walletButtonIntegrationService so we can use BraintreeSDKVersionManager
    const braintreeSDKVersionManager = {
        getSDKVersion: () => BRAINTREE_SDK_DEFAULT_VERSION,
    } as BraintreeSDKVersionManager;

    const braintreeIntegrationService = new BraintreeIntegrationService(
        new BraintreeScriptLoader(
            getScriptLoader(),
            braintreeHostWindow,
            braintreeSDKVersionManager,
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
