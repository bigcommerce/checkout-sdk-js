import { createRequestSender } from '@bigcommerce/request-sender';
import { CartActionCreator } from './cart';
import { CheckoutClient, CheckoutStore } from './checkout';
import { PlaceOrderService, OrderActionCreator } from './order';
import { PaymentActionCreator, PaymentMethodActionCreator, PaymentRequestSender } from './payment';

export default function createPlaceOrderService(
    store: CheckoutStore,
    client: CheckoutClient,
    paymentClient: any
): PlaceOrderService {
    const requestSender = createRequestSender();

    return new PlaceOrderService(
        store,
        new CartActionCreator(client),
        new OrderActionCreator(client),
        new PaymentActionCreator(new PaymentRequestSender(paymentClient)),
        new PaymentMethodActionCreator(client)
    );
}
