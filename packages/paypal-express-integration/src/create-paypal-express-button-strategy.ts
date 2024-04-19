import { createFormPoster } from '@bigcommerce/form-poster';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CheckoutButtonStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { PaypalExpressButtonStrategy, PaypalExpressScriptLoader } from './index';

const createPaypalExpressButtonStrategy: CheckoutButtonStrategyFactory<
    PaypalExpressButtonStrategy
> = (paymentIntegrationService) => {
    return new PaypalExpressButtonStrategy(
        paymentIntegrationService,
        new PaypalExpressScriptLoader(getScriptLoader()),
        createFormPoster(),
    );
};

export default toResolvableModule(createPaypalExpressButtonStrategy, [{ id: 'paypalexpress' }]);
