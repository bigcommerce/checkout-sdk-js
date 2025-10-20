import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import CBAMPGSPaymentStrategy from './cba-mpgs-payment-strategy';
import CBAMPGSScriptLoader from './cba-mpgs-script-loader';

const createCBAMPGSPaymentStrategy: PaymentStrategyFactory<CBAMPGSPaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new CBAMPGSPaymentStrategy(
        paymentIntegrationService,
        new CBAMPGSScriptLoader(getScriptLoader()),
    );
};

export default toResolvableModule(createCBAMPGSPaymentStrategy, [{ id: 'cba_mpgs' }]);
