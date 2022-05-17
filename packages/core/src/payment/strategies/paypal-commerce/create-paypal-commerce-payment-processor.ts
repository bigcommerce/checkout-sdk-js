import { RequestSender } from '@bigcommerce/request-sender';
import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaypalCommercePaymentProcessor, PaypalCommerceRequestSender, PaypalCommerceScriptLoader } from './index';

export default function createPaypalCommercePaymentProcessor(scriptLoader: ScriptLoader, requestSender: RequestSender) {
    const paypalScriptLoader = new PaypalCommerceScriptLoader(scriptLoader);
    const paypalCommerceRequestSender = new PaypalCommerceRequestSender(requestSender);

    return new PaypalCommercePaymentProcessor(paypalScriptLoader, paypalCommerceRequestSender);
}
