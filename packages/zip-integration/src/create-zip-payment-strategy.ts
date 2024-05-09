import { createRequestSender } from '@bigcommerce/request-sender';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import ZipPaymentStrategy from './zip-payment-strategy';

const createZipPaymentStrategy: PaymentStrategyFactory<ZipPaymentStrategy> = (
    paymentIntegrationService,
) => {
    const { getHost } = paymentIntegrationService.getState();
    const requestSender = createRequestSender({ host: getHost() });

    return new ZipPaymentStrategy(paymentIntegrationService, requestSender);
};

export default toResolvableModule(createZipPaymentStrategy, [{ id: 'zip' }]);
