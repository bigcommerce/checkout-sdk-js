import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createBigCommercePaymentsIntegrationService from '../create-bigcommerce-payments-integration-service';

import BigCommercePaymentsPayPalButtonStrategy from './bigcommerce-payments-paypal-button-strategy';

const createBigCommercePaymentsPaypalButtonStrategy: CheckoutButtonStrategyFactory<
    BigCommercePaymentsPayPalButtonStrategy
> = (paymentIntegrationService) =>
    new BigCommercePaymentsPayPalButtonStrategy(
        paymentIntegrationService,
        createBigCommercePaymentsIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createBigCommercePaymentsPaypalButtonStrategy, [
    { id: 'bigcommerce_payments_paypal' },
]);
