import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createBigCommerceIntegrationService from '../create-big-commerce-integration-service';

import BigCommerceAlternativeMethodsButtonStrategy from './big-commerce-alternative-methods-button-strategy';

const createBigCommerceAlternativeMethodsButtonStrategy: CheckoutButtonStrategyFactory<
    BigCommerceAlternativeMethodsButtonStrategy
> = (paymentIntegrationService) =>
    new BigCommerceAlternativeMethodsButtonStrategy(
        paymentIntegrationService,
        createBigCommerceIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createBigCommerceAlternativeMethodsButtonStrategy, [
    { id: 'bigcommercealternativemethods' },
]);
