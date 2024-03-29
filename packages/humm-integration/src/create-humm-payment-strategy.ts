import { createFormPoster } from '@bigcommerce/form-poster';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import HummPaymentStrategy from './humm-payment-strategy';

const createHummPaymentStrategy: PaymentStrategyFactory<HummPaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new HummPaymentStrategy(paymentIntegrationService, createFormPoster());
};

export default toResolvableModule(createHummPaymentStrategy, [{ id: 'humm' }]);
