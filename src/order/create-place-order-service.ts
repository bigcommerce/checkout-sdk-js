import { createRequestSender } from '@bigcommerce/request-sender';

import { CartActionCreator } from '../cart';
import { CheckoutClient, CheckoutStore } from '../checkout';
import { PaymentActionCreator, PaymentMethodActionCreator, PaymentRequestSender } from '../payment';

import OrderActionCreator from './order-action-creator';
import PlaceOrderService from './place-order-service';

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
