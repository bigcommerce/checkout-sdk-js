import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import createBigCommercePaymentsIntegrationService from '../create-bigcommerce-payments-integration-service';

import BigCommercePaymentsVenmoPaymentStrategy from './bigcommerce-payments-venmo-payment-strategy';

const createBigCommercePaymentsVenmoPaymentStrategy: PaymentStrategyFactory<
    BigCommercePaymentsVenmoPaymentStrategy
> = (paymentIntegrationService) =>
    new BigCommercePaymentsVenmoPaymentStrategy(
        paymentIntegrationService,
        createBigCommercePaymentsIntegrationService(paymentIntegrationService),
        new LoadingIndicator({ styles: { backgroundColor: 'black' } }),
    );

export default toResolvableModule(createBigCommercePaymentsVenmoPaymentStrategy, [
    { id: 'bigcommerce_payments_venmo' },
]);
