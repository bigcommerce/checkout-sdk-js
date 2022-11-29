import PaymentIntegrationService from '../payment-integration-service';

import CustomerStrategy from './customer-strategy';

type CustomerStrategyFactory<TStrategy extends CustomerStrategy> = (
    paymentIntegrationService: PaymentIntegrationService,
) => TStrategy;

export default CustomerStrategyFactory;
