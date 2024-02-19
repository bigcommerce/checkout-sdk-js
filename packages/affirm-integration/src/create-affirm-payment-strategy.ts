import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import AffirmPaymentStrategy from './affirm-payment-strategy';
import AffirmScriptLoader from './affirm-script-loader';

const createAffirmPaymentStrategy: PaymentStrategyFactory<AffirmPaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new AffirmPaymentStrategy(paymentIntegrationService, new AffirmScriptLoader());
};

export default toResolvableModule(createAffirmPaymentStrategy, [{ id: 'affirm' }]);
