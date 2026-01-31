import { createBigCommercePaymentsSdk } from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import { LOADING_INDICATOR_STYLES } from '../bigcommerce-payments-constants';
import createBigCommercePaymentsIntegrationService from '../create-bigcommerce-payments-integration-service';

import BigCommercePaymentsAlternativeMethodsPaymentStrategy from './bigcommerce-payments-alternative-methods-payment-strategy';

const createBigCommercePaymentsAlternativeMethodsPaymentStrategy: PaymentStrategyFactory<
    BigCommercePaymentsAlternativeMethodsPaymentStrategy
> = (paymentIntegrationService) => {
    console.log('createBigCommercePaymentsAlternativeMethodsPaymentStrategy');

    return new BigCommercePaymentsAlternativeMethodsPaymentStrategy(
        paymentIntegrationService,
        createBigCommercePaymentsIntegrationService(paymentIntegrationService),
        createBigCommercePaymentsSdk(),
        new LoadingIndicator({
            containerStyles: LOADING_INDICATOR_STYLES,
        }),
    );
}


export default toResolvableModule(createBigCommercePaymentsAlternativeMethodsPaymentStrategy, [
    // { gateway: 'bigcommerce_payments_apms' },
    { gateway: 'bigcommerce_payments_apms', id: 'klarna' },
]);
