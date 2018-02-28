import { createRequestSender } from '@bigcommerce/request-sender';
import { DataStore } from '@bigcommerce/data-store';
import { CheckoutClient, CheckoutSelectors } from './checkout';
import { UpdateShippingService, ShippingActionCreator, ShippingAddressActionCreator, ShippingOptionActionCreator } from './shipping';

export default function createUpdateShippingService(
    store: DataStore<CheckoutSelectors>,
    client: CheckoutClient
): UpdateShippingService {
    return new UpdateShippingService(
        store,
        new ShippingAddressActionCreator(client),
        new ShippingOptionActionCreator(client),
        new ShippingActionCreator()
    );
}
