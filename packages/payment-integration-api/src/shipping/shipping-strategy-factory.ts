import PaymentIntegrationService from '../payment-integration-service';

import ShippingStrategy from './shipping-strategy';

type ShippingStrategyFactory<TStrategy extends ShippingStrategy> = (
    paymentIntegrationService: PaymentIntegrationService,
) => TStrategy;

export default ShippingStrategyFactory;
