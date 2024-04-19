import { createFormPoster } from '@bigcommerce/form-poster';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import ExternalPaymentStrategy from './external-payment-strategy';

const createExternalPaymentStrategy: PaymentStrategyFactory<ExternalPaymentStrategy> = (
    paymentIntegrationService,
) => new ExternalPaymentStrategy(createFormPoster(), paymentIntegrationService);

export default toResolvableModule(createExternalPaymentStrategy, [{ id: 'laybuy' }]);
