import { CheckoutClient, CheckoutStore } from './checkout';
import { PlaceOrderService, OrderActionCreator } from './order';
import { PaymentActionCreator, PaymentRequestSender } from './payment';

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
