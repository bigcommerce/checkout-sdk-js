import { createRequestSender } from '@bigcommerce/request-sender';
import { DataStore } from '@bigcommerce/data-store';
import { CheckoutClient, CheckoutSelectors, CheckoutStore } from '../checkout';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';
import CustomerActionCreator from './customer-action-creator';
import SignInCustomerService from './sign-in-customer-service';

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
