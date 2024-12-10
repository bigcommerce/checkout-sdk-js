import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';

import PaypalCommerceHeadlessWalletStrategy from './paypal-commerce-headless-wallet-strategy';

const createPaypalCommerceHeadlessWalletStrategy: CheckoutButtonStrategyFactory<
    PaypalCommerceHeadlessWalletStrategy
> = (paymentIntegrationService) =>
    new PaypalCommerceHeadlessWalletStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createPaypalCommerceHeadlessWalletStrategy, [
    { id: 'paypalcommerce' },
]);
