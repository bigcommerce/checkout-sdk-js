import { createFormPoster } from '@bigcommerce/form-poster';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import SezzlePaymentStrategy from './sezzle-payment-strategy';

const createSezzlePaymentStrategy: PaymentStrategyFactory<SezzlePaymentStrategy> = (
    paymentIntegrationService,
) => new SezzlePaymentStrategy(createFormPoster(), paymentIntegrationService);

export default toResolvableModule(createSezzlePaymentStrategy, [{ id: 'sezzle' }]);
