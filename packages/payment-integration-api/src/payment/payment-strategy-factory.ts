import PaymentIntegrationService from '../payment-integration-service';

import PaymentStrategy from './payment-strategy';

type PaymentStrategyFactory<TStrategy extends PaymentStrategy> = (
    paymentIntegrationService: PaymentIntegrationService,
) => TStrategy;

export default PaymentStrategyFactory;
