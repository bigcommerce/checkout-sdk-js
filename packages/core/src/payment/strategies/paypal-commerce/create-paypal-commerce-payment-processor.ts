import { RequestSender } from '@bigcommerce/request-sender';
import { ScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutStore } from '../../../checkout';
import { OrderActionCreator } from '../../../order';
import PaymentActionCreator from '../../payment-action-creator';

import {
    PaypalCommercePaymentProcessor,
    PaypalCommerceRequestSender,
    PaypalCommerceScriptLoader,
} from './index';

export default function createPaypalCommercePaymentProcessor(
    scriptLoader: ScriptLoader,
    requestSender: RequestSender,
    store: CheckoutStore,
    orderActionCreator: OrderActionCreator,
    paymentActionCreator: PaymentActionCreator,
) {
    const paypalScriptLoader = new PaypalCommerceScriptLoader(scriptLoader);
    const paypalCommerceRequestSender = new PaypalCommerceRequestSender(requestSender);

    return new PaypalCommercePaymentProcessor(
        paypalScriptLoader,
        paypalCommerceRequestSender,
        store,
        orderActionCreator,
        paymentActionCreator,
    );
}
