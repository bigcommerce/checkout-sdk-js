import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createBigCommercePaymentsIntegrationService from '../create-bigcommerce-payments-integration-service';

import BigcommercePaymentsButtonStrategy from './bigcommerce-payments-button-strategy';

const createBigCommercePaymentsButtonStrategy: CheckoutButtonStrategyFactory<
    BigcommercePaymentsButtonStrategy
> = (paymentIntegrationService) =>
    new BigcommercePaymentsButtonStrategy(
        paymentIntegrationService,
        createBigCommercePaymentsIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createBigCommercePaymentsButtonStrategy, [
    { id: 'bigcommerce_payments' },
]);
