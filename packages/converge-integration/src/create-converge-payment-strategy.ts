import { createFormPoster } from '@bigcommerce/form-poster';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import ConvergePaymentStrategy from './converge-payment-strategy';

const createConvergePaymentStrategy: PaymentStrategyFactory<ConvergePaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new ConvergePaymentStrategy(paymentIntegrationService, createFormPoster());
};

export default toResolvableModule(createConvergePaymentStrategy, [{ id: 'converge' }]);
