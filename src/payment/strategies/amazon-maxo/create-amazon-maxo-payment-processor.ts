import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutStore } from '../../../checkout';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import PaymentMethodRequestSender from '../../payment-method-request-sender';

import AmazonMaxoPaymentProcessor from './amazon-maxo-payment-processor';
import AmazonMaxoScriptLoader from './amazon-maxo-script-loader';

export default function createAmazonMaxoPaymentProcessor(store: CheckoutStore): AmazonMaxoPaymentProcessor {
    const requestSender = createRequestSender();
    const scriptLoader = getScriptLoader();

    return new AmazonMaxoPaymentProcessor(
        store,
        new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender)
        ),
        new AmazonMaxoScriptLoader(scriptLoader)
    );
}
