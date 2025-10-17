import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import StripeLinkV2ButtonStrategy from './stripe-link-v2-button-strategy';
import {StripeIntegrationService, StripeScriptLoader} from '../stripe-utils';
import { DEFAULT_CONTAINER_STYLES, LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

const createLinkV2ButtonStrategy: CheckoutButtonStrategyFactory<StripeLinkV2ButtonStrategy> = (
    paymentIntegrationService,
) => {
    const stripeScriptLoader = new StripeScriptLoader(getScriptLoader());
    const loadingIndicator = new LoadingIndicator({
        containerStyles: DEFAULT_CONTAINER_STYLES,
    });

    return new StripeLinkV2ButtonStrategy(
        paymentIntegrationService,
        stripeScriptLoader,
        new StripeIntegrationService(paymentIntegrationService, stripeScriptLoader),
        loadingIndicator,
    );
};

export default toResolvableModule(createLinkV2ButtonStrategy, [{ id: 'stripeocs' }]);
