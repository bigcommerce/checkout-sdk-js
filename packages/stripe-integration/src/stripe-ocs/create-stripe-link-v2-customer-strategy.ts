import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    StripeIntegrationService,
    StripeScriptLoader,
} from '@bigcommerce/checkout-sdk/stripe-utils';
import { DEFAULT_CONTAINER_STYLES, LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import StripeLinkV2CustomerStrategy from './stripe-link-v2-customer-strategy';

const createStripeLinkV2CustomerStrategy: CustomerStrategyFactory<StripeLinkV2CustomerStrategy> = (
    paymentIntegrationService,
) => {
    const stripeScriptLoader = new StripeScriptLoader(getScriptLoader());
    const loadingIndicator = new LoadingIndicator({
        containerStyles: DEFAULT_CONTAINER_STYLES,
    });

    return new StripeLinkV2CustomerStrategy(
        paymentIntegrationService,
        stripeScriptLoader,
        new StripeIntegrationService(paymentIntegrationService, stripeScriptLoader),
        loadingIndicator,
    );
};

export default toResolvableModule(createStripeLinkV2CustomerStrategy, [{ id: 'stripeocs' }]);
