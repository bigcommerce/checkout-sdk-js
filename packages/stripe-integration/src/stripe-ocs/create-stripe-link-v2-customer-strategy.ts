import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { StripeIntegrationService, StripeScriptLoader } from '../stripe-utils';

import StripeLinkV2CustomerStrategy from './stripe-link-v2-customer-strategy';

const createStripeLinkV2CustomerStrategy: CustomerStrategyFactory<StripeLinkV2CustomerStrategy> = (
    paymentIntegrationService,
) => {
    const stripeScriptLoader = new StripeScriptLoader(getScriptLoader());

    return new StripeLinkV2CustomerStrategy(
        paymentIntegrationService,
        new StripeScriptLoader(getScriptLoader()),
        new StripeIntegrationService(paymentIntegrationService, stripeScriptLoader),
    );
};

export default toResolvableModule(createStripeLinkV2CustomerStrategy, [{ id: 'stripeocs' }]);
