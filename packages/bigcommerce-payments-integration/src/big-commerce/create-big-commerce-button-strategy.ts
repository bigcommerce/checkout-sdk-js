import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import createBigCommerceIntegrationService from '../create-big-commerce-integration-service';

import BigCommerceButtonStrategy from './big-commerce-button-strategy';

const createBigCommerceButtonStrategy: CheckoutButtonStrategyFactory<BigCommerceButtonStrategy> = (
    paymentIntegrationService,
) =>
    new BigCommerceButtonStrategy(
        paymentIntegrationService,
        createBigCommerceIntegrationService(paymentIntegrationService),
    );

export default toResolvableModule(createBigCommerceButtonStrategy, [{ id: 'bigcommerce' }]);
