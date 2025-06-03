import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { StripeScriptLoader } from '../stripe-utils';

import StripeLinkV2CustomerStrategy from './stripe-link-v2-customer-strategy';

const createStripeLinkV2CustomerStrategy: CustomerStrategyFactory<StripeLinkV2CustomerStrategy> = (
    paymentIntegrationService,
) => {
    return new StripeLinkV2CustomerStrategy(
        paymentIntegrationService,
        new StripeScriptLoader(getScriptLoader()),
    );
};

export default toResolvableModule(createStripeLinkV2CustomerStrategy, [{ id: 'stripeocs' }]);
