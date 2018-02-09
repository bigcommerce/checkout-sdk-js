import { createRequestSender } from '@bigcommerce/request-sender';
import { CheckoutClient, CheckoutSelectors } from './checkout';
import { DataStore } from '../data-store';
import { UpdateShippingService, ShippingAddressActionCreator, ShippingOptionActionCreator } from './shipping';

export default function createUpdateShippingService(
    store: DataStore<CheckoutSelectors>,
    client: CheckoutClient
): UpdateShippingService {
    return new UpdateShippingService(
        store,
        new ShippingAddressActionCreator(client),
        new ShippingOptionActionCreator(client)
    );
}
