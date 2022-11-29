import PaymentIntegrationService from '../payment-integration-service';

import CheckoutButtonStrategy from './checkout-button-strategy';

type CheckoutButtonStrategyFactory<TStrategy extends CheckoutButtonStrategy> = (
    paymentIntegrationService: PaymentIntegrationService,
) => TStrategy;

export default CheckoutButtonStrategyFactory;
