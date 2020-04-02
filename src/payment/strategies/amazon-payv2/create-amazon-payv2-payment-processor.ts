import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutStore } from '../../../checkout';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import PaymentMethodRequestSender from '../../payment-method-request-sender';

import AmazonPayv2PaymentProcessor from './amazon-payv2-payment-processor';
import AmazonPayv2ScriptLoader from './amazon-payv2-script-loader';

export default function createAmazonPayv2PaymentProcessor(store: CheckoutStore): AmazonPayv2PaymentProcessor {
    const requestSender = createRequestSender();
    const scriptLoader = getScriptLoader();

    return new AmazonPayv2PaymentProcessor(
        store,
        new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender)
        ),
        new AmazonPayv2ScriptLoader(scriptLoader)
    );
}
