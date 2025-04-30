import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import createBigCommerceIntegrationService from '../create-big-commerce-integration-service';

import BigCommerceVenmoPaymentStrategy from './big-commerce-venmo-payment-strategy';

const createBigCommerceVenmoPaymentStrategy: PaymentStrategyFactory<
    BigCommerceVenmoPaymentStrategy
> = (paymentIntegrationService) =>
    new BigCommerceVenmoPaymentStrategy(
        paymentIntegrationService,
        createBigCommerceIntegrationService(paymentIntegrationService),
        new LoadingIndicator({ styles: { backgroundColor: 'black' } }),
    );

export default toResolvableModule(createBigCommerceVenmoPaymentStrategy, [
    { id: 'bigcommerce_payments_venmo' },
]);
