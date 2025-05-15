import { createRequestSender } from '@bigcommerce/request-sender';

import {
    createBigCommercePaymentsFastlaneUtils,
    createBigCommercePaymentsSdk,
} from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BigCommercePaymentsRequestSender from '../bigcommerce-payments-request-sender';

import BigCommercePaymentsFastlanePaymentStrategy from './bigcommerce-payments-fastlane-payment-strategy';

const createBigCommercePaymentsFastlanePaymentStrategy: PaymentStrategyFactory<
    BigCommercePaymentsFastlanePaymentStrategy
> = (paymentIntegrationService) => {
    const { getHost } = paymentIntegrationService.getState();

    return new BigCommercePaymentsFastlanePaymentStrategy(
        paymentIntegrationService,
        new BigCommercePaymentsRequestSender(createRequestSender({ host: getHost() })),
        createBigCommercePaymentsSdk(),
        createBigCommercePaymentsFastlaneUtils(),
    );
};

export default toResolvableModule(createBigCommercePaymentsFastlanePaymentStrategy, [
    { id: 'bigcommerce_payments_acceleratedcheckout' }, // BigCommercePayments Fastlane relates to 'bigcommerce_payments_acceleratedcheckout' method id
]);
