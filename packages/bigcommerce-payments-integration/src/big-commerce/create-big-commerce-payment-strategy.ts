import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import { LOADING_INDICATOR_STYLES } from '../big-commerce-constants';
import createBigCommerceIntegrationService from '../create-big-commerce-integration-service';

import BigCommercePaymentStrategy from './big-commerce-payment-strategy';

const createBigCommercePaymentStrategy: PaymentStrategyFactory<BigCommercePaymentStrategy> = (
    paymentIntegrationService,
) =>
    new BigCommercePaymentStrategy(
        paymentIntegrationService,
        createBigCommerceIntegrationService(paymentIntegrationService),
        new LoadingIndicator({
            containerStyles: LOADING_INDICATOR_STYLES,
        }),
    );

export default toResolvableModule(createBigCommercePaymentStrategy, [{ id: 'bigcommerce' }]);
