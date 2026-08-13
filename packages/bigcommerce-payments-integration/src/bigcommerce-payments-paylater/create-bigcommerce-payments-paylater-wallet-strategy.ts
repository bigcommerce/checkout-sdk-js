import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    createPayPalSdkScriptLoader,
    PaypalCommerceWalletService,
} from '@bigcommerce/checkout-sdk/paypal-utils';
import { WalletPaymentButtonStrategyFactory } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import BigCommercePaymentsPayLaterWalletStrategy from './bigcommerce-payments-paylater-wallet-strategy';

const createBigCommercePaymentsPayLaterWalletStrategy: WalletPaymentButtonStrategyFactory<
    BigCommercePaymentsPayLaterWalletStrategy
> = (walletButtonIntegrationService) =>
    new BigCommercePaymentsPayLaterWalletStrategy(
        new PaypalCommerceWalletService(
            walletButtonIntegrationService,
            createPayPalSdkScriptLoader(),
            'BigcommercePaymentWalletIntentData',
        ),
    );

export default toResolvableModule(createBigCommercePaymentsPayLaterWalletStrategy, [
    { id: 'bigcommerce_paymentspaypalcredit' },
]);
