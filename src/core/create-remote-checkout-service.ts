/// <reference path="./common/http-request/request-sender.d.ts" />

import { createRequestSender } from '@bigcommerce/request-sender';
import { DataStore } from '@bigcommerce/data-store';
import { CheckoutClient, CheckoutSelectors } from './checkout';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender, RemoteCheckoutService } from './remote-checkout';
import { ShippingAddressActionCreator } from './shipping';
import { BillingAddressActionCreator } from './billing';

export default function createRemoteCheckoutService(
    store: DataStore<CheckoutSelectors>,
    client: CheckoutClient
): RemoteCheckoutService {
    return new RemoteCheckoutService(
        store,
        new BillingAddressActionCreator(client),
        new ShippingAddressActionCreator(client),
        new RemoteCheckoutActionCreator(new RemoteCheckoutRequestSender(createRequestSender()))
    );
}
