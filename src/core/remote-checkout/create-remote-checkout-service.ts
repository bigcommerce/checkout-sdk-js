/// <reference path="../common/http-request/request-sender.d.ts" />

import { createRequestSender } from '@bigcommerce/request-sender';
import { DataStore } from '@bigcommerce/data-store';
import { CheckoutClient, CheckoutSelectors } from '../checkout';
import { ShippingAddressActionCreator } from '../shipping';
import { BillingAddressActionCreator } from '../billing';
import RemoteCheckoutActionCreator from './remote-checkout-action-creator';
import RemoteCheckoutRequestSender from './remote-checkout-request-sender';
import RemoteCheckoutService from './remote-checkout-service';

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
