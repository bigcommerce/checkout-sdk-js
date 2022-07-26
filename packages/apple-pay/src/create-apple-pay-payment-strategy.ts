
import { PaymentStrategyFactory, toResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration';
import { createRequestSender } from '@bigcommerce/request-sender';

import ApplePayPaymentStrategy from './apple-pay-payment-strategy';
import ApplePaySessionFactory from './apple-pay-session-factory';

const createApplePayPaymentStrategy: PaymentStrategyFactory<ApplePayPaymentStrategy> = (
    paymentIntegrationService
) => {
    const { getHost } = paymentIntegrationService.getState();

    return new ApplePayPaymentStrategy(
        createRequestSender({ host: getHost() }),
        paymentIntegrationService,
        new ApplePaySessionFactory()
    );
}

export default toResolvableModule(
    createApplePayPaymentStrategy,
    [{ id: 'applepay' }]
);
