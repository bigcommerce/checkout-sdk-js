import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutStore } from '../../../checkout';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import PaymentMethodRequestSender from '../../payment-method-request-sender';

import AmazonPayV2PaymentProcessor from './amazon-pay-v2-payment-processor';
import AmazonPayV2ScriptLoader from './amazon-pay-v2-script-loader';

export default function createAmazonPayV2PaymentProcessor(store: CheckoutStore): AmazonPayV2PaymentProcessor {
    const requestSender = createRequestSender();
    const scriptLoader = getScriptLoader();

    return new AmazonPayV2PaymentProcessor(
        store,
        new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender)
        ),
        new AmazonPayV2ScriptLoader(scriptLoader)
    );
}
