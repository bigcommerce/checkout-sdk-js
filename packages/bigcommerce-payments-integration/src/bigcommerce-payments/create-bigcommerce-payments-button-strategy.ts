import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createBigCommercePaymentsIntegrationService from '../create-bigcommerce-payments-integration-service';

import BigCommercePaymentsButtonStrategy from './bigcommerce-payments-button-strategy';

const createBigCommercePaymentsButtonStrategy: CheckoutButtonStrategyFactory<
    BigCommercePaymentsButtonStrategy
> = (paymentIntegrationService) =>
    new BigCommercePaymentsButtonStrategy(
        paymentIntegrationService,
        createBigCommercePaymentsIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createBigCommercePaymentsButtonStrategy, [
    { id: 'bigcommerce_payments' },
]);
