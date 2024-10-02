import { createRequestSender } from '@bigcommerce/request-sender';

import {
    PaymentStrategyFactory,
    StorefrontPaymentRequestSender,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import ZipPaymentStrategy from './zip-payment-strategy';

const createZipPaymentStrategy: PaymentStrategyFactory<ZipPaymentStrategy> = (
    paymentIntegrationService,
) => {
    const { getHost } = paymentIntegrationService.getState();
    const requestSender = createRequestSender({ host: getHost() });
    const storefrontPaymentRequestSender = new StorefrontPaymentRequestSender(requestSender);

    return new ZipPaymentStrategy(paymentIntegrationService, storefrontPaymentRequestSender);
};

export default toResolvableModule(createZipPaymentStrategy, [{ id: 'zip' }, { id: 'quadpay' }]);
