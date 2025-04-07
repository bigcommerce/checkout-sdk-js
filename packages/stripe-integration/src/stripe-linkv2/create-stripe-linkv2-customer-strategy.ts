import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CustomerStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import StripeUPEScriptLoader from '../stripe-upe/stripe-upe-script-loader';

import StripeLinkV2CustomerStrategy from './stripe-linkv2-customer-strategy';

const createStripeLinkV2CustomerStrategy: CustomerStrategyFactory<StripeLinkV2CustomerStrategy> = (
    paymentIntegrationService,
) => {
    return new StripeLinkV2CustomerStrategy(
        paymentIntegrationService,
        new StripeUPEScriptLoader(getScriptLoader()),
    );
};

export default toResolvableModule(createStripeLinkV2CustomerStrategy, [{ id: 'stripeupe' }]);
