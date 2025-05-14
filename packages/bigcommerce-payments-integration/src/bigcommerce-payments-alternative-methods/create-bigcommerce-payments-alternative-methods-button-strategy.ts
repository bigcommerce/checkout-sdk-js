import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createBigCommercePaymentsIntegrationService from '../create-bigcommerce-payments-integration-service';

import BigCommercePaymentsAlternativeMethodsButtonStrategy from './bigcommerce-payments-alternative-methods-button-strategy';

const createBigCommercePaymentsAlternativeMethodsButtonStrategy: CheckoutButtonStrategyFactory<
    BigCommercePaymentsAlternativeMethodsButtonStrategy
> = (paymentIntegrationService) =>
    new BigCommercePaymentsAlternativeMethodsButtonStrategy(
        paymentIntegrationService,
        createBigCommercePaymentsIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createBigCommercePaymentsAlternativeMethodsButtonStrategy, [
    { id: 'bigcommerce_payments_apms' },
]);
