import { getScriptLoader, getStylesheetLoader } from '@bigcommerce/script-loader';

import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import DigitalRiverPaymentStrategy from './digitalriver-payment-strategy';
import DigitalRiverScriptLoader from './digitalriver-script-loader';

const createDigitalRiverPaymentStrategy: PaymentStrategyFactory<DigitalRiverPaymentStrategy> = (
    paymentIntegrationService,
) =>
    new DigitalRiverPaymentStrategy(
        paymentIntegrationService,
        new DigitalRiverScriptLoader(getScriptLoader(), getStylesheetLoader()),
    );

export default toResolvableModule(createDigitalRiverPaymentStrategy, [{ id: 'digitalriver' }]);
