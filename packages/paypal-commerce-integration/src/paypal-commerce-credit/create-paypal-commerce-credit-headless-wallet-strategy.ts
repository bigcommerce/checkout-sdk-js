import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createPayPalCommerceIntegrationService from '../create-paypal-commerce-integration-service';

import PaypalCommerceCreditHeadlessWalletStrategy from './paypal-commerce-credit-headless-wallet-strategy';

const createPayPalCommerceHeadlessButtonStrategy: CheckoutButtonStrategyFactory<
    PaypalCommerceCreditHeadlessWalletStrategy
> = (paymentIntegrationService) =>
    new PaypalCommerceCreditHeadlessWalletStrategy(
        paymentIntegrationService,
        createPayPalCommerceIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createPayPalCommerceHeadlessButtonStrategy, [
    { id: 'paypalcommercecredit' },
]);
