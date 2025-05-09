import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { HeadlessWalletButtonStrategyFactory } from '@bigcommerce/checkout-sdk/headless-wallet-button-integration';
import { toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';

import PaypalCommerceHeadlessWalletButtonService from '../paypal-commerce-headless-wallet-button-service';
import PayPalCommerceRequestSender from '../paypal-commerce-request-sender';
import PayPalCommerceScriptLoader from '../paypal-commerce-script-loader';

import PaypalCommerceHeadlessWalletStrategy from './paypal-commerce-headless-wallet-strategy';

const createPaypalCommerceHeadlessWalletStrategy: HeadlessWalletButtonStrategyFactory<
    PaypalCommerceHeadlessWalletStrategy
> = () =>
    new PaypalCommerceHeadlessWalletStrategy(
        new PaypalCommerceHeadlessWalletButtonService(
            new PayPalCommerceRequestSender(createRequestSender()),
            new PayPalCommerceScriptLoader(getScriptLoader()),
        ),
    );

export default toResolvableModule(createPaypalCommerceHeadlessWalletStrategy, [
    { id: 'paypalcommercepaypal' },
]);
