import { CheckoutClient, CheckoutStore } from '../checkout';
import { PaymentActionCreator, PaymentRequestSender } from '../payment';

import OrderActionCreator from './order-action-creator';
import PlaceOrderService from './place-order-service';

export default function createPlaceOrderService(
    store: CheckoutStore,
    client: CheckoutClient,
    paymentClient: any
): PlaceOrderService {
    return new PlaceOrderService(
        store,
        new OrderActionCreator(client),
        new PaymentActionCreator(new PaymentRequestSender(paymentClient))
    );
}
