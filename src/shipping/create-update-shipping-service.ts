import { createRequestSender } from '@bigcommerce/request-sender';
import { DataStore } from '@bigcommerce/data-store';
import { CheckoutClient, CheckoutSelectors } from '../checkout';
import ShippingActionCreator from './shipping-action-creator';
import ShippingAddressActionCreator from './shipping-address-action-creator';
import ShippingOptionActionCreator from './shipping-option-action-creator';
import UpdateShippingService from './update-shipping-service';

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
