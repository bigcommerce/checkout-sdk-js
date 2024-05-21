import { createFormPoster } from '@bigcommerce/form-poster';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import SagePayPaymentStrategy from './sage-pay-payment-strategy';

const createSagePayPaymentStrategy: PaymentStrategyFactory<SagePayPaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new SagePayPaymentStrategy(paymentIntegrationService, createFormPoster());
};

export default toResolvableModule(createSagePayPaymentStrategy, [{ id: 'sagepay' }]);
