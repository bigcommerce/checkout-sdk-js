import { createRequestSender } from '@bigcommerce/request-sender';
import { DataStore } from '@bigcommerce/data-store';
import { CheckoutClient, CheckoutSelectors, CheckoutStore } from './checkout';
import { CustomerActionCreator, SignInCustomerService } from './customer';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from './remote-checkout';

export default function createSignInCustomerService(
    store: CheckoutStore,
    client: CheckoutClient
): SignInCustomerService {
    return new SignInCustomerService(
        store,
        new CustomerActionCreator(client),
        new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(createRequestSender())
        )
    );
}
