import { getScriptLoader } from '@bigcommerce/script-loader';
import localStorageFallback from 'local-storage-fallback';

import { AnalyticsExtraItemsManager } from '@bigcommerce/checkout-sdk/analytics';
import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BoltPaymentStrategy from './bolt-payment-strategy';
import BoltScriptLoader from './bolt-script-loader';

const createBoltPaymentStrategy: PaymentStrategyFactory<BoltPaymentStrategy> = (
    paymentIntegrationService,
) => {
    return new BoltPaymentStrategy(
        paymentIntegrationService,
        new BoltScriptLoader(getScriptLoader()),
        new AnalyticsExtraItemsManager(localStorageFallback),
    );
};

export default toResolvableModule(createBoltPaymentStrategy, [{ id: 'bolt' }]);
